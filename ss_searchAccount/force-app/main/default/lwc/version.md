handleSearch(event) {
	const searchKey = event.target.value.toLowerCase();
	if (searchKey) {
	  let recs = [];
	  for (let rec of this.data) {
		if (rec.accountId.toLowerCase().includes(searchKey) || rec.accountName.toLowerCase().includes(searchKey)) {
		  recs.push(rec);
		}
	  }
	  this.tableData = recs;
	} else {
	  this.tableData = this.initialRecords;
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
		  let fieldLabel = this.fields.find(field => field.value == fieldName)?.label ?? fieldName;
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
  
  handleSearch(event) {
    const searchKey = event.target.value.toLowerCase();
    if (searchKey) {
      this.data = this.initialRecords;
      if (this.data) {
        let recs = [];
        for (let rec of this.data) {
          if (rec.accountId.toLowerCase().includes(searchKey) || rec.accountName.toLowerCase().includes(searchKey)) {
            recs.push(rec);
          }
        }
        this.data = recs;
      }
    } else {
      this.data = this.initialRecords;
    }
  }

  resetAll(event) {
	// Clear all the data present in the filtered data array.
	this.emptyAllFieldOptions();
	// Clear all the selections in the filter picklist
	this.template
	  .querySelectorAll("lightning-combobox")
	  .forEach((currentElement) => {
		currentElement.value = null;
	  });
	// Reset table data to the original values.
	this.tableData = JSON.parse(JSON.stringify(this.tableDataCopy));
	// Remove all the pills from the screen.
	this.pillData = [];
	// Reset all the available options inside the filter picklist
	this.updatePicklistValues();
	//!!
	this.data = this.tableDataCopy;
  }

  resetAll(event) {
	// Clear all the data present in the filtered data array.
	this.emptyAllFieldOptions();
	// Clear all the selections in the filter picklist
	this.template.querySelectorAll("lightning-combobox").forEach((currentElement) => {
	  currentElement.value = null;
	});
	// Remove all the pills from the screen.
	this.pillData = [];
	// Reset all the available options inside the filter picklist
	this.updatePicklistValues();
	// Reset only the filtered data, but keep the input filters as is.
	this.tableData = JSON.parse(JSON.stringify(this.tableDataCopy)).filter((row) => {
	  for (let fieldName in this.filterFields) {
		if (this.filterFields[fieldName] && row[fieldName] !== this.filterFields[fieldName]) {
		  return false;
		}
	  }
	  return true;
	});
  }
  this.data = filteredDataByInput.length > 0 ? filteredDataByInput : this.tableDataCopy;
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
    //console.log("this.tableData ===> " + JSON.stringify(this.tableData));
    //console.log("this.filterData ===> " + JSON.stringify(this.filterData));
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

  updateTableDataBasedOnAvailablePills() {
	let remainingPills = this.pillData;
	let filteredData = JSON.parse(JSON.stringify(this.tableDataCopy));
	if (remainingPills.length > 0) {
	  for (let i = 0; i < remainingPills.length; i++) {
		let currentFieldName = remainingPills[i].fieldName;
		let currentFieldValue = remainingPills[i].fieldValue;
		filteredData = filteredData.filter((currentElement) => {
		  return currentElement[currentFieldName] === currentFieldValue;
		});
	  }
	}
	this.tableData = filteredData;
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
      }
    );

    //console.log("localTableDataList" + localTableDataList);
  }

