import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent
} from "typeorm";

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<any> {
  beforeInsert(event: InsertEvent<any>) {
    const userId = event.queryRunner.data?.userId;

    if (userId && event.entity) {
      event.entity.created_by = userId;
    }
  }
}