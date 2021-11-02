/**
 * @license
 * Copyright (c) 2014, 2020, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/*
 * Your dashboard ViewModel code goes here
 */
define(['knockout',         
        'ojs/ojarraydataprovider',     
        "ojs/ojlistdataproviderview",  
        "ojs/ojdataprovider",
        'ojs/ojinputtext',                
        'ojs/ojbufferingdataprovider',        
        'ojs/ojarraytabledatasource',                
        'ojs/ojtable',
        "ojs/ojbutton", 
        "ojs/ojformlayout",
        ],
 function(ko, ArrayDataProvider, ListDataProviderView, ojdataprovider_1) {
     
    function DashboardViewModel() {
        // Below are a set of the ViewModel methods invoked by the oj-module component.
        // Please reference the oj-module jsDoc for additional information.
             /**
       * Optional ViewModel method invoked after the View is inserted into the
       * document DOM.  The application can put logic that requires the DOM being
       * attached here.
       * This method might be called multiple times - after the View is created
       * and inserted into the DOM and after the View is reconnected
       * after being disconnected.
       */
        this.connected = () => {                    
          var rootViewModel = ko.dataFor(document.getElementById('globalBody'));                          
          rootViewModel.authorize();          
        };

        var self = this;
        
        self.filter = ko.observable("");                 
        
        self.editRow = ko.observable();
        
        self.data = ko.observableArray();
        
        self.newHolding = ko.observable();

        self.datasource = ko.computed(function () {                        
          
            $.getJSON(ko.dataFor(document.getElementById('globalBody')).serviceContext + "/holdings/").
                then(function (clients) {                                        
                    self.data(clients);                                        
            });             
            
            let filterCriterion = null;                        

            if (self.filter() && self.filter() != "") {
                filterCriterion = ojdataprovider_1.FilterFactory.getFilter({
                    filterDef: { text: self.filter() }                    
                });
                console.log(filterCriterion);
            }                        
                       
            const arrayDataProvider = new ArrayDataProvider(
                self.data,
                {idAttribute: 'id'}
            ); 
    
            //console.log(self.data());

            return new ListDataProviderView(arrayDataProvider, 
                                            {filterCriterion: filterCriterion},
                                            );
            
            /*
            self.datasource = new BufferingDataProvider(new oj.ArrayDataProvider(
                self.data,
                {idAttribute: 'id'}
            )); 
            */                                          
            
        });             
        
        self.editedData = ko.observable("");
        
        self.beforeRowEditListener = (event) => {
              self.cancelEdit = false;
              const rowContext = event.detail.rowContext;
              //console.log(rowContext.status);
              //console.log(self.data()[rowContext.status.rowIndex]);
              
              //console.log("rowContext.status = " + JSON.stringify(rowContext.status));
              //console.log("self.data() = " + JSON.stringify(self.data()));
              
              self.getById(rowContext.status.rowKey)
              
              self.originalData = Object.assign({}, self.getById(rowContext.status.rowKey));
              self.rowData = Object.assign({}, self.getById(rowContext.status.rowKey));
              
              //self.originalData = Object.assign({}, rowContext.item.data);
              //self.rowData = Object.assign({}, rowContext.item.data);
              
              console.log(self.rowData);
        };
        
        // handle validation of editable components and when edit has been cancelled
        self.beforeRowEditEndListener = (event) => {
            console.log(event);
            self.editedData("");            
            const detail = event.detail; 
            if (!detail.cancelEdit && !self.cancelEdit) {
                if (self.hasValidationErrorInRow(document.getElementById("table"))) {
                    event.preventDefault();
                }
                else {
                    if (self.isRowDataUpdated()) {
                        const key = detail.rowContext.status.rowIndex;
                        self.submitRow(key);
                    }
                }
            }
        };
        
        self.submitRow = (key) => {                                       
                 
            console.log(key);

            $.ajax({                    
              type: "PUT",
              url: ko.dataFor(document.getElementById('globalBody')).serviceContext + "/holdings/update",                                        
              dataType: "json",      
              data: JSON.stringify(self.rowData),			  		 
              //crossDomain: true,
              contentType : "application/json",                    
              success: function() {                    
                    alert("Registro grabado correctamente");
                    var val = $("#filter").val();
                    $("#filter").val(" ");
                    $("#filter").val(val);
              },
              error: function (request, status, error) {
                    alert(request.responseText);                          
              },                                  
            });
                                                                           
        };
        
        self.isRowDataUpdated = () => {
            const propNames = Object.getOwnPropertyNames(self.rowData);
            for (let i = 0; i < propNames.length; i++) {
                if (self.rowData[propNames[i]] !== self.originalData[propNames[i]]) {
                    return true;
                }
            }
            return false;
        };
        
        // checking for validity of editables inside a row
        // return false if one of them is considered as invalid
        self.hasValidationErrorInRow = (table) => {
            const editables = table.querySelectorAll(".editable");
            for (let i = 0; i < editables.length; i++) {
                const editable = editables.item(i);
                /*
                editable.validate();
                // Table does not currently support editables with async validators
                // so treating editable with 'pending' state as invalid
                if (editable.valid !== "valid") {
                    return true;
                }
                */
            }
            return false;
        };
        
        self.handleUpdate = (event, context) => {
            //console.log(context);
            self.editRow({ rowKey: context.row.id });
        };
        
        self.handleDone = () => {
            self.editRow({ rowKey: null });
        };
        
        self.handleCancel = () => {                                                                 
            
            var txt;
            var r = confirm("¿Está seguro que desea eliminar el registro?");
            
            if (r == true) {
                self.deleteRow(self.rowData.id);
            } else {              
                self.cancelEdit = true;
                self.editRow({ rowKey: null });    
            }                        
        };
        
        self.handleValueChanged = () => {
            self.filter(document.getElementById("filter").rawValue);
        };
        
        self.getById = (id) => {                      
            
            var toReturn; 
                 
            $(self.data()).each(function(key,value) {                                 
                
                if(value.id === id) {                    
                    toReturn = value;
                    return false;
                }                
            });
            
            return toReturn;
                                                                           
        };
        
        self.deleteRow = (key) => {                                       
                 
            console.log(key);

            $.ajax({                    
              type: "DELETE",
              url: ko.dataFor(document.getElementById('globalBody')).serviceContext + "/holdings/delete/" + key,                                        
              dataType: "json",                    
              //crossDomain: true,
              contentType : "application/json",                    
              success: function() {                    
                    alert("Registro borrado correctamente");
                    var val = $("#filter").val();
                    $("#filter").val(" ");
                    $("#filter").val(val);
              },
              error: function (request, status, error) {
                    alert(request.responseText);                          
              },                                  
            });                                                                           
        };
        
        self.openDialog = function(event, data) {                        
            document.getElementById("dialog1").open();                 
        }      
        
        self.createHolding = function (event, data) {
                                                                                                                
            // submit the form would go here
            //alert("everything is valid; submit the form");
            var holding = {};

            holding.name = self.newHolding();

            console.log(JSON.stringify(holding));

            $.ajax({                    
                type: "POST",
                url: ko.dataFor(document.getElementById('globalBody')).serviceContext + "/holdings/new",                                        
                dataType: "json",      
                data: JSON.stringify(holding),			  		 
                //crossDomain: true,
                contentType : "application/json",                    
                success: function() {                    
                    alert("Registro grabado correctamente");
                    document.getElementById("dialog1").close();    
                    var val = $("#filter").val();
                    $("#filter").val(" ");
                    $("#filter").val(val);
                },
                error: function (request, status, error) {                                
                    alert(error);                          
                },                                  
            });

        }                            
                                                        
    }
    
    /*
     * Returns an instance of the ViewModel providing one instance of the ViewModel. If needed,
     * return a constructor for the ViewModel so that the ViewModel is constructed
     * each time the view is displayed.
     */
    return DashboardViewModel;
  }
);
