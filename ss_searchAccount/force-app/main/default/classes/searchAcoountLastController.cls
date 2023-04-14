public with sharing class searchAcoountLastController {
  public class ContactDetailsWrapper {
    @AuraEnabled
    public String accountId { get; set; }
    @AuraEnabled
    public String College { get; set; }
    @AuraEnabled
    public String Program { get; set; }
    @AuraEnabled
    public String studentCohort { get; set; }
    @AuraEnabled
    public String accountName { get; set; }
    @Auraenabled
    public String accountImg {get; set;}
  }

  @AuraEnabled(cacheable=true)
  public static List<searchAcoountLastController.ContactDetailsWrapper> getApplication() {
    List<Application__c> applicationList = [
      SELECT
        Account__r.Id,
        Account__r.Name,
        Account__r.Image__c,
        Program__c,
        College__c,
        Student_Cohort__c
      FROM Application__c
    ];

    List<searchAcoountLastController.ContactDetailsWrapper> applicationWrapperList = new List<searchAcoountLastController.ContactDetailsWrapper>();

    for (Application__c aObj : applicationList) {
      searchAcoountLastController.ContactDetailsWrapper cdWrapper = new searchAcoountLastController.ContactDetailsWrapper();
      cdWrapper.accountId = aObj.Account__r.Id;
      cdWrapper.accountName = aObj.Account__r.Name;
      cdWrapper.Program = aObj.Program__c;
      cdWrapper.accountImg = aObj.Account__r.Image__c;
      cdWrapper.College = aObj.College__c;
      cdWrapper.studentCohort = aObj.Student_Cohort__c;
      applicationWrapperList.add(cdWrapper);
    }
    System.debug(JSON.serialize(applicationWrapperList));
    return applicationWrapperList;
  }
}