import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsController } from './controllers/events.controller';
import { EventsService } from './services/events.service';
import { Event, EventSchema } from './schemas/event.schema';
import { ConditionsModule } from '../conditions/conditions.module';
import { RewardsModule } from '../rewards/rewards.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema }
    ]),
    ConditionsModule,
    RewardsModule,
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
