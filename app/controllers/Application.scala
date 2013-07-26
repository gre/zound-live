package controllers

import play.api._
import play.api.mvc._

import play.api.libs.iteratee._
import play.api.libs.concurrent._
import play.api.libs.json._

object Application extends Controller {

  def index = Action { implicit request =>
    Ok(views.html.index("Your new application is ready."))
  }

}

object EventManager extends Controller {

  val (outputStream, channel) = Concurrent.broadcast[JsValue]

  def endpoint = WebSocket.using[JsValue] { request =>
    // in: handle messages from the user
    val inputStream =
      Enumeratee.collect[JsValue]{
      	case o:JsObject => o
      } &>> Iteratee.foreach { o =>
      	play.Logger.info("received: "+o)
        channel push o
      }

    (inputStream, outputStream)
  }

}