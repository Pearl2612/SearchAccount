import getApplication from "@salesforce/apex/searchAcoountLastController.getApplication";
import { LightningElement, wire, track, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";

const columns = [
  { label: "Profile picture", fieldName: "accountImg", type: "customImage" },
  {
    label: "Student name",
    fieldName: "accountName",
    sortable: "true",
    type: "button",
    typeAttributes: { label: { fieldName: "accountName" }, variant: "base" }
  },
  { label: "Student ID", fieldName: "accountId", sortable: "true" },
  { label: "College", fieldName: "College", sortable: "true" },
  { label: "Program", fieldName: "Program", sortable: "true" },
  { label: "Student Cohort:", fieldName: "studentCohort", sortable: "true" }
];
export default class search extends NavigationMixin(LightningElement) {
  @track data;
  @track columns = columns;
  error;
  @track sortBy;
  @track sortDirection;
  @track initialRecords;
  searchString;
  @wire(getApplication)
  getApplicationApi({ error, data }) {
    if (data) {
      console.log(data);
      this.data = data;
      this.initialRecords = data;
      this.error = undefined;
    } else if (error) {
      console.error(error);
      this.error = error;
      this.data = undefined;
    }
  }
  handleSortAccountData(event) {
    this.sortBy = event.detail.fieldName;
    this.sortDirection = event.detail.sortDirection;
    this.sortAccountData(event.detail.fieldName, event.detail.sortDirection);
  }

  sortAccountData(fieldname, direction) {
    let parseData = JSON.parse(JSON.stringify(this.data));

    let keyValue = (a) => {
      return a[fieldname];
    };

    let isReverse = direction === "asc" ? 1 : -1;

    parseData.sort((x, y) => {
      x = keyValue(x) ? keyValue(x) : "";
      y = keyValue(y) ? keyValue(y) : "";

      return isReverse * ((x > y) - (y > x));
    });

    this.data = parseData;
  }

  handleSearch(event) {
    const searchKey = event.target.value.toLowerCase();
    if (searchKey) {
      let recs = [];
      for (let rec of this.data) {
        if (
          rec.accountId.toLowerCase().includes(searchKey) ||
          rec.accountName.toLowerCase().includes(searchKey)
        ) {
          recs.push(rec);
        }
      }
      this.tableData = recs;
      this.data = recs;
    } else {
      this.tableData = this.initialRecords;
      this.data = this.initialRecords;
    }
    this.emptyAllFieldOptions();
    this.updatePicklistValues();
    this.generatePillData();
  }
  generatePillData() {
    this.pillData = [];
    for (let fieldName in this.filterFields) {
      if (this.filterFields.hasOwnProperty(fieldName)) {
        let fieldValue = this.filterFields[fieldName];
        if (fieldValue) {
          let fieldLabel =
            this.fields.find((field) => field.value == fieldName)?.label ??
            fieldName;
          this.pillData.push({
            fieldIndex: this.pillData.length,
            fieldValue: fieldValue,
            fieldName: fieldName,
            fieldLabel: fieldLabel + ":" + fieldValue
          });
        }
      }
    }
  }

  handleSearchChange(event) {
    this.searchString = event.detail.value;
    //console.log("Updated Search String is " + this.searchString);
  }

  @api tableData;
  tableDataCopy;
  @api tableColumns;
  @api filterColumnsAPINames = ["College", "Program", "studentCohort"];
  @api filterColumnLabels = ["College", "Program", "Student Cohort"];
  filterData = [];
  pillData = [];
  connectedCallback() {
    // Fetch the list of accounts
    getApplication().then((result) => {
      this.tableData = result;
      // Keeping a copy of the actual data set
      this.tableDataCopy = JSON.parse(JSON.stringify(this.tableData));
      // Based on the result set update the filter picklists.
      this.updatePicklistValues();
      //console.log("tableData: " + JSON.stringify(this.tableData));
    });
  }
  updatePicklistValues() {
    // Logic to populate the filter picklists.
    this.filterColumnsAPINames.forEach((currentElement, index) => {
      this.filterData = [
        ...this.filterData,
        {
          fieldIndex: index,
          fieldName: currentElement,
          fieldLabel: this.filterColumnLabels[index],
          fieldValue: "",
          fieldOptions: this.getFieldOptions(currentElement)
        }
      ];
    });
    //console.log("this.filterData ===> " + JSON.stringify(this.filterData));
  }
  getFieldOptions(fieldApiName) {
    // Logic to keep only unique values in the filter picklist
    let toReturn = [];
    let tempValueArray = [];
    this.tableData.forEach((currentElement, index) => {
      if (tempValueArray.indexOf(currentElement[fieldApiName]) < 0) {
        tempValueArray.push(currentElement[fieldApiName]);
        toReturn = [
          ...toReturn,
          {
            label: currentElement[fieldApiName],
            value: currentElement[fieldApiName]
          }
        ];
      }
    });
    return toReturn;
  }
  
  //changeHandler
  changeHandler(event) {
    // Logic to update the data inside the datatable based on the values selected in the picklist.
    let currentFieldName = event.target.name;
    let currentFieldValue = event.target.value;
    let currentFieldLabel = event.target.label;
    let localTableDataList = [];
    this.tableData.forEach((currentElement) => {
      if (currentElement[currentFieldName] == currentFieldValue) {
        localTableDataList = [...localTableDataList, currentElement];
      }
    });
    this.tableData = localTableDataList;
    this.emptyAllFieldOptions();
    this.updatePicklistValues();
    // Generate Pill Data on selection / change of values from the filter picklist
    this.pillData = [
      ...this.pillData,
      {
        fieldIndex: this.pillData.length,
        fieldValue: currentFieldValue,
        fieldName: currentFieldName,
        fieldLabel: currentFieldLabel + ":" + currentFieldValue
      }
    ];
    this.data = localTableDataList;
  }

  emptyAllFieldOptions() {
    // Clear all the data present in the filtered data array.
    this.filterData = [];
    //console.log("this.filterData" + this.filterData);
  }
  // eslint-disable-next-line no-dupe-class-members
  updatePicklistValues() {
    // Logic to populate the filter picklists.
    this.filterColumnsAPINames.forEach((currentElement, index) => {
      this.filterData = [
        ...this.filterData,
        {
          fieldIndex: index,
          fieldName: currentElement,
          fieldLabel: this.filterColumnLabels[index],
          fieldValue: "",
          fieldOptions: this.getFieldOptions(currentElement)
        }
      ];
    });
    //console.log("this.filterData ===> " + JSON.stringify(this.filterData));
  }
  //resetAll
  resetAll(event) {
    // Clear all the data present in the filtered data array.
    this.emptyAllFieldOptions();
    // Clear all the selections in the filter picklist
    this.template.querySelectorAll("lightning-combobox").forEach((currentElement) => {
      if (currentElement.value !== null) {
        currentElement.value = null;
      }
    });
    // Reset table data to the original values.
    this.tableData = JSON.parse(JSON.stringify(this.tableDataCopy));
    // Remove all the pills from the screen.
    this.pillData = [];
    // Reset all the available options inside the filter picklist
    this.updatePicklistValues();
    // Reset the filtered data to the original data.
    this.data = this.tableDataCopy;
  }
  

  //remove handler box
  removeHandler(event) {
    let currentFieldLabel = event.target.label;
    let currentFieldName = event.target.name;
    let currentFieldValue = event.target.dataset.value;
    let currentFieldIndex = event.target.dataset.index;
    // Remove this pill from pillData array.

    this.pillData.splice(currentFieldIndex, 1);
    // If there are no pills that means nothing selected from the picklist
    // and hence we should reset the data inside the datatable to the original
    // dataset.
    if (this.pillData.length <= -1)
      this.tableData = JSON.parse(JSON.stringify(this.tableDataCopy));
    // Else there are some selections still remaining and hence we should show
    // the data inside the datatable based on the remaining selection
    else this.updateTableDataBasedOnAvailablePills();
    // Reset the value selected for the corresponding filter picklist to NONE.
    this.template
      .querySelectorAll("lightning-combobox")
      .forEach((currentElement, index) => {
        if (currentElement.name == currentFieldName)
          currentElement.value = null;
      });
    // At first clear the filtered Data array.
    this.emptyAllFieldOptions();
    // Then reset it based on the selected values in the remaining filter picklist
    this.updatePicklistValues();
  }
  updateTableDataBasedOnAvailablePills() {
    // Logic to update the data inside the datatable based on the available pill values.
    const localTableDataList = [];
    this.tableDataCopy.forEach(
      (currentTableDataElement, currentTableDataIndex) => {
        let matchCount = 0;
        const fieldMatches = {}; // Sử dụng một đối tượng để đếm số lượng phù hợp của mỗi trường fieldName
        this.pillData.forEach(
          (currentPillDataElement, currentPillDataIndex) => {
            if (
              currentTableDataElement[currentPillDataElement.fieldName] ===
              currentPillDataElement.fieldValue
            ) {
              matchCount++;
              fieldMatches[currentPillDataElement.fieldName] = true; // Đếm số lượng phù hợp của trường fieldName này
            }
          }
        );

        // Nếu số lượng phù hợp bằng với số lượng phần tử trong this.pillData và đầy đủ các trường fieldName thì thêm vào bảng dữ liệu mới
        if (
          matchCount === this.pillData.length &&
          Object.keys(fieldMatches).length === this.pillData.length
        ) {
          localTableDataList.push(currentTableDataElement);
        }

        this.data = localTableDataList;
        this.tableData = localTableDataList;
      }
    );

    //console.log("localTableDataList" + localTableDataList);
  }
  handleRowAction(event) {
    const row = event.detail.row;
    this[NavigationMixin.Navigate]({
      type: "standard__recordPage",
      attributes: {
        recordId: row.accountId,
        actionName: "view"
      }
    });
  }
}
