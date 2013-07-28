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

  def index = Action { implicit request =>
    Ok(views.html.index("Your new application is ready."))
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

// class Atomic[T](val atomic : AtomicReference[T]) {
//   @tailrec
//   final def update(f: T => T) : T = {
//     val oldValue = atomic.get()
//     val newValue = f(oldValue)
//     if (atomic.compareAndSet(oldValue, newValue)) newValue else update(f)
//   }

//   def getAndset()
// }

// object Atomic {
//   def apply[T]( obj : T ) = new Atomic(new AtomicReference(obj))
//   implicit def toAtomic[T]( ref : AtomicReference[T]) : Atomic[T] = new Atomic(ref)

//   implicit def delegateToAtomicReference[T]( a: Atomic[T] ) = a.atomic
// }

object EventManager extends Controller {
  import scala.collection.mutable._
  val events = new SynchronizedQueue[JsValue]

  val (outputStream, channel) = Concurrent.broadcast[JsValue]

  def endpoint = WebSocket.using[JsValue] { request =>
    // in: handle messages from the user
    val inputStream =
      Enumeratee.collect[JsValue]{
        case o:JsObject => o
      } &>> Iteratee.foreach { o =>
        play.Logger.info("received: "+o)
        Json.fromJson(o)(Event.reader)
            .map{ e =>
              play.Logger.debug("Event:"+e)
              e.typ match {
                case "user-connect" =>
                  events += o
                  events.map(e => channel.push(e))
                case _ => channel.push(o)
              }
            }
            .recoverTotal{ e =>
              play.Logger.error("Bad Event:"+e)
            }
      }

    (inputStream, outputStream)
  }

 }
