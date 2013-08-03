package controllers

import play.api._
import play.api.mvc._

import play.api.libs.iteratee._
import play.api.libs.concurrent._
import play.api.libs.json._
import play.api.libs.functional.syntax._
import java.util.concurrent.atomic.AtomicReference
import annotation.tailrec

object Application extends Controller {

  def index(user: Option[String] = None)  = Action { implicit request =>
    Ok(views.html.index("Your new application is ready.", user))
  }

  def listUsers = Action{
    Ok(
      EventManager.users.foldLeft(Json.obj()){ case (all, (user, data)) => 
        all ++ Json.obj( user -> data ) 
      }
    )
  }

}

case class Event(user: String, typ: String, data: Option[JsObject] = None)
object Event {
  val reader = (
  	(__ \ "user").read[String] and
  	(__ \ "type").read[String] and
  	(__ \ "data").readNullable[JsObject]
  )(Event.apply _)

  val writer = (
  	(__ \ "user").write[String] and
  	(__ \ "type").write[String] and
  	(__ \ "data").writeNullable[JsObject]
  )(unlift(Event.unapply))
}

object EventManager extends Controller {
  import scala.collection.mutable._
  val users = new HashMap[String, JsObject] with SynchronizedMap[String, JsObject]

  val (outputStream, channel) = Concurrent.broadcast[JsValue]

  def endpoint(user: String) = WebSocket.using[JsValue] { request =>
    // in: handle messages from the user
    val inputStream =
      Enumeratee.collect[JsValue]{
        case o:JsObject => o
      } &>> Iteratee.foreach { o: JsObject =>
        Json.fromJson(o)(Event.reader)
            .map{ e =>
              play.Logger.debug("Event:"+e)
              e.typ match {
                case "user-connect" =>
                  e.data match {
                    case Some(data) => 
                      // adds user to list of users
                      (data \ "user").asOpt[String].foreach{ user =>
                        if(user != "" && users != "null"){
                          play.Logger.info(s"New user $user connected")
                          users += (user -> Json.obj())
                        }
                      }
                      users.foreach{ case (user, data) =>
                        channel.push(Json.obj(
                          "type" -> "user-connect",
                          "user" -> user,
                          "data" -> Json.obj(
                            "user" -> user
                          )
                        ))
                      }
                      channel.push(o)

                    case None => 
                      play.Logger.error("Bad Event Data Format:"+e.data)
                  }
                case _ => channel.push(o)
              }
            }
            .recoverTotal{ e =>
              play.Logger.error("Bad Event:"+e)
            }
      }.map { _ =>
        play.Logger.info(s"User $user disconnected")
        users -= user
        channel.push(Json.obj(
          "type" -> "user-disconnect",
          "user" -> user,
          "data" -> Json.obj(
            "user" -> user
          )
        ))
      }

    (inputStream, outputStream)
  }

}
