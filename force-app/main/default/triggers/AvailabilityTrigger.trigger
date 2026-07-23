trigger AvailabilityTrigger on Availability__c(
  before insert,
  before update,
  before delete
) {
  if (Trigger.isDelete) {
    AvailabilityHandler.enforceDraftOnly(Trigger.old);
  } else {
    AvailabilityHandler.enforceDraftOnly(Trigger.new);
  }
}
