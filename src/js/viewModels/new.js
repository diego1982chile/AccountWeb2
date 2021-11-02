/**
 * @license
 * Copyright (c) 2014, 2020, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
/*
 * Your incidents ViewModel code goes here
 */
define(["knockout",             
        "ojs/ojasyncvalidator-regexp",
        "ojs/ojarraydataprovider",
        "ojs/ojselectcombobox",        
        "ojs/ojselectsingle",
        "ojs/ojlabel", 
        "ojs/ojlabelvalue",
        "ojs/ojformlayout",         
        "ojs/ojbutton", 
        "ojs/ojinputtext",         
        "ojs/ojlistitemlayout",
        'ojs/ojknockout-validation'
    ],
 function(ko, AsyncRegExpValidator, ArrayDataProvider) {

    function IncidentsViewModel() {
        
        this.connected = () => {                    
          var rootViewModel = ko.dataFor(document.getElementById('globalBody'));                          
          rootViewModel.authorize();          
        };
        
        var self = this;
        // Below are a set of the ViewModel methods invoked by the oj-module component.
        // Please reference the oj-module jsDoc for additional information.       

        self.clientArray = ko.observableArray();                   

        self.client = ko.observable();

        self.clients = ko.computed(function () {                        

            $.getJSON(ko.dataFor(document.getElementById('globalBody')).serviceContext + "/clients/").
                then(function (clients) {                                        
                  self.clientArray(clients);                                        
            });                                

            return new ArrayDataProvider(
                self.clientArray,
                {idAttribute: 'id'}
            );        

        });   
        
        this.getItemText = function (itemContext) {
            return itemContext.data.name;
        };
        
        self.holdingArray = ko.observableArray();                   

        self.holding = ko.observable();
        
        self.holdings = ko.computed(function () {                        

            $.getJSON(ko.dataFor(document.getElementById('globalBody')).serviceContext + "/holdings/").
                then(function (holdings) {                                        
                  self.holdingArray(holdings);                                        
            });                                

            return new ArrayDataProvider(
                self.holdingArray,
                {idAttribute: 'id'}
            );        

        }); 
        
        self.client = ko.observable();
        
        self.user = ko.observable();
        
        self.password = ko.observable();
        
        self.company = ko.observable();
        
        self.createItem = function (event, data) {
            
            let element1 = document.getElementById("client");
            let element2 = document.getElementById("holding");            
            let element3 = document.getElementById("user");
            let element4 = document.getElementById("password");
            
            let valid = false;
            // validate them both, and when they are both done
            // validating and valid, submit the form.
            // Calling validate() will update the component's
            // valid property
            element1.validate().then((result1) => {

                element2.validate().then((result2) => {
                    
                    element3.validate().then((result3) => {
                                        
                        element4.validate().then((result4) => {
                            
                            if (result1 === "valid" && result2 === "valid" &&
                                result3 === "valid" && result4 === "valid") {
                                // submit the form would go here
                                //alert("everything is valid; submit the form");
                                var account = {};
            
                                account.client = self.getClientById(data.client());
                                account.holding = self.getHoldingById(data.holding());
                                account.user = data.user();
                                account.password = data.password();
                                account.company = data.company();

                                //console.log(JSON.stringify(account));
                                
                                //alert(JSON.stringify(account));

                                $.ajax({                    
                                    type: "POST",
                                    url: ko.dataFor(document.getElementById('globalBody')).serviceContext + "/accounts/new",                                        
                                    dataType: "json",      
                                    data: JSON.stringify(account),			  		 
                                    //crossDomain: true,
                                    contentType : "application/json",                    
                                    success: function() {                    
                                        alert("Registro grabado correctamente");
                                        $("input").val("");                                          
                                    },
                                    error: function (request, status, error) {
                                        alert(request.responseText);                          
                                    },                                  
                                });            
                            }
                         
                        });
                    });
                });
            });
                                                
        }
        
        self.getClientById = (id) => {                      
            
            var toReturn; 
                 
            $(self.clientArray()).each(function(key,value) {                                 
                
                if(value.id === id) {                    
                    toReturn = value;
                    return false;
                }                
            });
            
            return toReturn;                                                                           
        };
        
        self.getHoldingById = (id) => {                      
            
            var toReturn; 
                 
            $(self.holdingArray()).each(function(key,value) {                                 
                
                if(value.id === id) {                    
                    toReturn = value;
                    return false;
                }                
            });
            
            return toReturn;                                                                           
        };
        
        this.goToAccounts = () => {                    
          var rootViewModel = ko.dataFor(document.getElementById('globalBody'));                                    
          rootViewModel.router.go({path: 'accounts'});
        };
        
        this.userValid = ko.observable("invalidHidden");                
      
    }
    /*
     * Returns an instance of the ViewModel providing one instance of the ViewModel. If needed,
     * return a constructor for the ViewModel so that the ViewModel is constructed
     * each time the view is displayed.
     */
    return IncidentsViewModel;    
 });
