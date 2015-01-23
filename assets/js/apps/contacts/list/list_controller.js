ContactManager.module("ContactsApp.List", function(List, ContactManager, Backbone, Marionette, $, _){
  List.Controller = {
    listContacts: function(){
      var fetchingContacts = ContactManager.request("contact:entities");

      var contactsListLayoutView = new List.LayoutView();
      var contactsListPanel = new List.Panel();

      $.when(fetchingContacts).done(function(contacts){
	var contactsListView = new List.Contacts({
	  collection: contacts
	});

	contactsListLayoutView.on("show", function(){
	  contactsListLayoutView.panelRegion.show(contactsListPanel);
	  contactsListLayoutView.contactsRegion.show(contactsListView);
	});

	contactsListPanel.on("contact:new", function(){
	  var newContact = new ContactManager.Entities.Contact();

	  var view = new ContactManager.ContactsApp.New.Contact({
	    model: newContact, 
	    asModal: true
	  });

	  view.on("form:submit", function(data){
	    var highestId = contacts.max(function(c){ return c.id; });
	    highestId = highestId.get("id");
	    data.id = highestId + 1;
	    if(newContact.save(data)){
	      contacts.add(newContact);
	      ContactManager.dialogRegion.reset();
	      contactsListView.children.findByModel(newContact).flash("success");
	    }
	    else{
	      view.triggerMethod("form:data:invalid", newContact.validationError);
	    }
	  });

	  ContactManager.dialogRegion.show(view);
	})

	contactsListView.on("childview:contact:show", function(childView, model){
	  ContactManager.trigger("contact:show", model.get("id"));
	});

	contactsListView.on("childview:contact:edit", function(childView, model){
	  var view = new ContactManager.ContactsApp.Edit.Contact({
	    model: model,
	    asModal: true
	  });

	  view.on("form:submit", function(data){
	    if(model.save(data)){
	      childView.render();
	      ContactManager.dialogRegion.reset();
	      childView.flash("success")
	    }
	    else{
	      view.triggerMethod("form:data:invalid", model.validationError);
	    }
	  });

	  ContactManager.dialogRegion.show(view);
	});

	contactsListView.on("childview:contact:delete", function(childView, model){
	  model.destroy();
	});

	ContactManager.mainRegion.show(contactsListLayoutView);
      });
    }
  }
});
