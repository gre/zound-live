import sbt._
import Keys._
import play.Project._

object ApplicationBuild extends Build {

  val appName         = "zound-live"
  val appVersion      = "0.1-SNAPSHOT"

  val appDependencies = Seq(
    // Add your project dependencies here,
    jdbc,
    anorm
  )


  val main = play.Project(appName, appVersion, appDependencies).settings(
    // Add your own project settings here      
  )

}
