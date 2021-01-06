import { Service, SERVICE_APP } from '../app/types'
import {
  DatabaseConfig,
  DatabaseConnectionTypes,
  DatabaseManager,
  SERVICE_DATABASE,
} from './types'
import { DatabaseError } from './errors/DatabaseError'
import { Pg } from './drivers/Pg'
import { Container } from '../container/types'
import { VisionElixirDatabase } from './lib/VisionElixirDatabase'
import { App } from '../app/lib/App'

export default class DatabaseService implements Service {
  public globalInit(container: Container): void {
    const database = new VisionElixirDatabase()

    container.singleton(SERVICE_DATABASE, database)
  }

  public globalBoot(container: Container): void {
    const { app, database } = container.resolve<{
      app: App
      database: DatabaseManager
    }>(SERVICE_APP, SERVICE_DATABASE)

    const { database: databaseConfig } = app.getConfig()

    if (databaseConfig) {
      DatabaseService.setupConnections(database, databaseConfig)
    } else {
    }
  }

  public static setupConnections = (
    databaseManager: DatabaseManager,
    config: DatabaseConfig,
  ): void => {
    for (const i in config.connections) {
      const connection = config.connections[i]

      switch (connection.type) {
        case DatabaseConnectionTypes.PG:
          databaseManager.add(i, new Pg(i, connection))
          break
        default:
          throw new DatabaseError(`
        Cannot handle database connection of type ${connection.type}
        `)
      }
    }
  }
}