jQuery(document).ready(function () {
  var table = $("#collectible_list").DataTable({
    //responsive: true,
    pagingType: "full_numbers",
    pageLength: 25,
    searching: false,
    language: {
      infoFiltered: ""
    },
    lengthChange: false,
    processing: true,
    serverSide: true,
    scrollX: true,
    ajax: {
      url: "/populateAllCollectibles",
      type: "POST",
      data: function (d) {
        d.search_collectible = $("#search_collectible").val(), d.token_type = $("#token_type").val(), d.search_collectible_by_category = $("#search_collectible_by_category").val(), d.search_collectible_by_artist = $("#search_collectible_by_artist").val(), d.collectible_ban_status = $("#collectible_status").val(), d.collectible_hide_status = $("#filter_is_hide").val(), d.collectible_featured_status = $("#filter_is_featured").val(), d.collectible_burn_status = $("#filter_is_burn").val();
      }
    },
    columnDefs: [{ orderable: false, targets: 0 }, {
      targets: 5,
      render: $.fn.dataTable.render.ellipsis(15)
    }]
  });

  //change collectible status
  $(document).on("click", ".change_collectible_status", function (e) {
    e.preventDefault();

    var table = $("#collectible_list").DataTable();
    var id = $(this).data("id");
    var cmd = $(this).attr("data-cmd");

    switch (cmd) {
      case "hide":
        var alert_text = "Do You Really want to Hide this Collectible?";
        var success_alert_text = "Collectible Hidden Successfully";
        break;
      case "ban":
        var alert_text = "Do You Really want to Ban this Collectible?";
        var success_alert_text = "Collectible Banned Successfully";
        break;
      default:
    }

    Swal.fire({
      title: "Are you sure?",
      html: "Confirm Update Collectible Status ?",
      type: "warning",
      showCancelButton: true,
      confirmButtonText: "Confirm!",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      closeOnConfirm: false,
      reverseButtons: true
    }).then(e => {
      if (e.value) {
        KTApp.blockPage({
          overlayColor: "#000000",
          state: "danger",
          message: "Please wait..."
        });
        $.ajax({
          url: "/updateCollectibleStatus",
          method: "POST",
          data: { id: id, cmd: cmd }
        }).done(function (res) {
          if (res.success) {
            console.log("id from ajax call is", res);
            //window.location.reload();
            if (table) {
              //KTApp.unblockPage();
              table.draw(false);
            }
            Swal.fire({
              title: "Success",
              html: "Status Updated Successfully",
              icon: "success"
            });
            KTApp.unblockPage();
          } else {
            console.log("error...ajax");
            KTApp.unblockPage();
          }
        });
      } else {
        console.log("cancelled");
      }
    });
  });

  //get the list of owners for a selected collectible
  var table_collectible_owners = $("#collectible_owner_list").DataTable({
    //responsive: true,
    pagingType: "full_numbers",
    pageLength: 25,
    searching: false,
    language: {
      infoFiltered: ""
    },
    lengthChange: false,
    processing: true,
    serverSide: true,
    scrollX: true,
    ajax: {
      url: "/populateCollectibleOwners",
      type: "POST",
      data: function (d) {
        d.collectible_uuid = $("#collectible_uuid").val(), d.token_type = $("#token_type").val(), d.search_collectible_by_category = $("#search_collectible_by_category").val(), d.search_collectible_by_artist = $("#search_collectible_by_artist").val(), d.search_collectible_by_owner = $("#search_collectible_by_owner").val();
      }
    },
    columnDefs: [{ orderable: false, targets: 0 }, {
      targets: 4,
      render: $.fn.dataTable.render.ellipsis(15)
    }, {
      targets: 5,
      render: $.fn.dataTable.render.ellipsis(15)
    }]
  });

  //get all collections list
  var collections = $("#collectiion_list").DataTable({
    responsive: true,
    pagingType: "full_numbers",
    pageLength: 25,
    searching: false,
    language: {
      infoFiltered: ""
    },
    lengthChange: false,
    processing: true,
    serverSide: true,
    ajax: {
      url: "/populateAllCollections",
      type: "POST",
      data: function (d) {
        d.collection_name = $("#collection_name").val(), d.token_type = $("#token_type").val(), d.collection_type = $("#collection_type").val();
      }
    },
    columnDefs: [{ orderable: false, targets: 0 }]
  });

  $("#searchBtn").on("click", function (e) {
    e.preventDefault();

    KTApp.blockPage({
      overlayColor: "#000000",
      state: "danger",
      message: "Please wait..."
    });
    table.ajax.reload();
    KTApp.unblockPage();
  });

  //search collectible owners table
  $("#searchBtn_collectible_owners").on("click", function (e) {
    e.preventDefault();

    KTApp.blockPage({
      overlayColor: "#000000",
      state: "danger",
      message: "Please wait..."
    });
    table_collectible_owners.ajax.reload();
    KTApp.unblockPage();
  });

  //reset collectible filters
  $("#reset_collectible_search_form").on("click", function (e) {
    e.preventDefault();

    KTApp.blockPage({
      overlayColor: "#000000",
      state: "danger",
      message: "Please wait..."
    });
    $("#search_collectible").val("");
    $("#token_type").val("");
    $("#search_collectible_by_category").val("");
    $("#collectible_status").val("");
    $("#search_collectible_by_artist").val("");
    $("#filter_is_hide").val("");
    $("#filter_is_featured").val("");
    $("#filter_is_burn").val("");

    table.ajax.reload();

    KTApp.unblockPage();
  });

  //search collection data
  $("#search_collections").on("click", function (e) {
    e.preventDefault();

    KTApp.blockPage({
      overlayColor: "#000000",
      state: "danger",
      message: "Please wait..."
    });
    collections.ajax.reload();
    KTApp.unblockPage();
  });

  //make the collectible curated/undo-curated based on command
  $(document).on("click", ".change_curate_art_status", function (e) {
    e.preventDefault();

    var id = $(this).data("id");
    var cmd = $(this).attr("data-cmd");
    var collectible_id = $(this).attr("data-collectibleid");
    var action_from = $(this).attr("data-actionfrom");
    if (action_from == "curated_table") {
      var table = $("#collectible_curated_list").DataTable();
    } else {
      var table = $("#collectible_owner_list").DataTable();
    }

    switch (cmd) {
      case "make_curated":
        var alert_text = "Do You Really want to make this Collectible as Curated Art?";
        var success_alert_text = "Collectible Curated Successfully";
        break;
      case "undo_curated":
        var alert_text = "Do You Really want to Remove this Collectible from Curated List?";
        var success_alert_text = "Collectible Removed from Curated List Successfully";
        break;
      default:
    }

    Swal.fire({
      title: "Are you sure?",
      html: "Confirm Update Collectible Status ?",
      type: "warning",
      showCancelButton: true,
      confirmButtonText: "Confirm!",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      closeOnConfirm: false,
      reverseButtons: true
    }).then(e => {
      if (e.value) {
        KTApp.blockPage({
          overlayColor: "#000000",
          state: "danger",
          message: "Please wait..."
        });
        $.ajax({
          url: "/updateCuratedArtList",
          method: "POST",
          data: { id: id, cmd: cmd, collectible_id: collectible_id }
        }).done(function (res) {
          if (res.success) {
            console.log("id from ajax call is", res);
            //window.location.reload();
            if (table) {
              //KTApp.unblockPage();
              table.draw(false);
            }
            Swal.fire({
              title: "Success",
              html: "Status Updated Successfully",
              icon: "success"
            });
            KTApp.unblockPage();
          } else {
            console.log("error...ajax");
            KTApp.unblockPage();
          }
        });
      } else {
        console.log("cancelled");
      }
    });
  });

  //curated arts list
  var collectible_curated_list = $("#collectible_curated_list").DataTable({
    //responsive: true,
    pagingType: "full_numbers",
    pageLength: 25,
    searching: false,
    language: {
      infoFiltered: ""
    },
    lengthChange: false,
    processing: true,
    serverSide: true,
    scrollX: true,
    ajax: {
      url: "/populateCuratedArts",
      type: "POST",
      data: function (d) {
        d.collectible_uuid = $("#collectible_uuid").val(), d.token_type = $("#token_type").val(), d.search_collectible_by_category = $("#search_collectible_by_category").val(), d.search_collectible_by_artist = $("#search_collectible_by_artist").val(), d.search_collectible_by_owner = $("#search_collectible_by_owner").val();
      }
    },
    columnDefs: [{ orderable: false, targets: 0 }, {
      targets: 4,
      render: $.fn.dataTable.render.ellipsis(15)
    }, {
      targets: 5,
      render: $.fn.dataTable.render.ellipsis(15)
    }]
  });

  //search curated collectibles
  $("#searchBtn_curated_collectibles").on("click", function (e) {
    e.preventDefault();

    KTApp.blockPage({
      overlayColor: "#000000",
      state: "danger",
      message: "Please wait..."
    });
    collectible_curated_list.ajax.reload();
    KTApp.unblockPage();
  });

  //get featured arts list
  var featured_arts_table = $("#featured_art_list").DataTable({
    //responsive: true,
    pagingType: "full_numbers",
    pageLength: 25,
    searching: false,
    language: {
      infoFiltered: ""
    },
    lengthChange: false,
    processing: true,
    serverSide: true,
    scrollX: true,
    ajax: {
      url: "/populateFeaturedArts",
      type: "POST",
      data: function (d) {
        d.search_collectible = $("#search_collectible").val(), d.token_type = $("#token_type").val(), d.search_collectible_by_category = $("#search_collectible_by_category").val(), d.search_collectible_by_artist = $("#search_collectible_by_artist").val(), d.collectible_ban_status = $("#collectible_status").val();
      }
    },
    columnDefs: [{ orderable: false, targets: 0 }, {
      targets: 5,
      render: $.fn.dataTable.render.ellipsis(15)
    }]
  });

  //search featured arts table
  $("#searchBtn_featured_arts").on("click", function (e) {
    e.preventDefault();

    KTApp.blockPage({
      overlayColor: "#000000",
      state: "danger",
      message: "Please wait..."
    });
    featured_arts_table.ajax.reload();
    KTApp.unblockPage();
  });

  //reset featured arts search form
  $("#reset_featured_arts").on("click", function (e) {
    e.preventDefault();

    KTApp.blockPage({
      overlayColor: "#000000",
      state: "danger",
      message: "Please wait..."
    });
    $("#search_collectible").val("");
    $("#token_type").val("");
    $("#search_collectible_by_category").val("");
    $("#collectible_status").val("");
    $("#search_collectible_by_artist").val("");

    featured_arts_table.ajax.reload();

    KTApp.unblockPage();
  });

  //make/update featured arts status
  $(document).on("click", ".change_featured_art_status", function (e) {
    e.preventDefault();

    var id = $(this).data("id");
    var cmd = $(this).attr("data-cmd");
    var action_from = $(this).attr("data-actionfrom");

    console.log("action from" + action_from);

    if (action_from == "featured_art_list") {
      var table = $("#featured_art_list").DataTable();
    } else {
      var table = $("#collectible_list").DataTable();
    }

    switch (cmd) {
      case "make_featured_art":
        var alert_text = "Do You Really want to make this Collectible as Featured Art?";
        var success_alert_text = "Collectible Added to Featured List Successfully";
        break;
      case "undo_featured_art":
        var alert_text = "Do You Really want to Remove this Collectible from Featured Arts List?";
        var success_alert_text = "Collectible Removed from Featured Art List Successfully";
        break;
      default:
    }

    Swal.fire({
      title: "Are you sure?",
      html: "Confirm Update Collectible Status ?",
      type: "warning",
      showCancelButton: true,
      confirmButtonText: "Confirm!",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      closeOnConfirm: false,
      reverseButtons: true
    }).then(e => {
      if (e.value) {
        KTApp.blockPage({
          overlayColor: "#000000",
          state: "danger",
          message: "Please wait..."
        });
        $.ajax({
          url: "/updateFeaturedArts",
          method: "POST",
          data: { id: id, cmd: cmd }
        }).done(function (res) {
          if (res.success) {
            console.log("id from ajax call is", res);
            //window.location.reload();
            if (table) {
              //KTApp.unblockPage();
              table.draw(false);
              //table.ajax.reload();
            }
            Swal.fire({
              title: "Success",
              html: "Status Updated Successfully",
              icon: "success"
            });
            KTApp.unblockPage();
          } else {
            console.log("error...ajax");
            KTApp.unblockPage();
          }
        });
      } else {
        console.log("cancelled");
      }
    });
  });

  //manage edit collectibles page validations
  //form validations
  KTFormControls.init();
});

// Class definition
var KTFormControls = function () {

  // Private functions
  var validator;

  var _initDemo1 = function () {

    validator = FormValidation.formValidation(document.getElementById('editCollectible'), {
      fields: {
        collectible_category: {
          validators: {
            notEmpty: {
              message: 'Collectible Category is required'
            }
          }
        },
        collectible_lock_status: {
          validators: {
            notEmpty: {
              message: 'Locked Status is required'
            }
          }
        },
        locked_content: {
          validators: {
            notEmpty: {
              enabled: false,
              message: 'Locked Content is required'
            }
          }
        }

      },

      plugins: { //Learn more: https://formvalidation.io/guide/plugins
        trigger: new FormValidation.plugins.Trigger(),
        // Validate fields when clicking the Submit button
        submitButton: new FormValidation.plugins.SubmitButton(),
        // Submit the form when all fields are valid
        // defaultSubmit: new FormValidation.plugins.DefaultSubmit(),
        // Bootstrap Framework Integration
        bootstrap: new FormValidation.plugins.Bootstrap({
          eleInvalidClass: '',
          eleValidClass: ''
        })
      }
    }).on('core.form.valid', function (e) {

      // Send the form data to back-end
      // You need to grab the form data and create an Ajax request to send them
      Swal.fire({
        title: "Are you Confirm?",
        text: "Confirm to Update this Data?",
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "Confirm",
        cancelButtonText: "Cancel",
        reverseButtons: true
      }).then(function (result) {

        var action = $('#editCollectible').attr('action');

        if (result.value) {
          KTApp.blockPage({
            overlayColor: "#000000",
            type: "loader",
            state: 'primary',
            message: "Please wait..."
          });

          FormValidation.utils.fetch(action, {
            method: 'POST',
            params: {
              collectible_uuid: editCollectible.querySelector('[name="collectible_uuid"]').value,
              collectible_category: editCollectible.querySelector('[name="collectible_category"]').value,
              collectible_lock_status: editCollectible.querySelector('[name="collectible_lock_status"]').value,
              locked_content: editCollectible.querySelector('[name="locked_content"]').value
            }
          }).then(function (response) {
            // Depending on the response from server, you can display a notification
            // to let user know if the form is sent successfully
            console.log(response);
            if (response.status === 'success') {

              Swal.fire("Success!", "Data Updated Successfully", "success");
              //location.reload();
              window.location.replace(response.redirect_url);
            } else {

              Swal.fire("Failed", "Something went wrong while processing", "error");
              KTApp.unblockPage();
            }
          });
        } else if (result.dismiss === "cancel") {

          Swal.fire("Cancelled", "Cancelled Action", "error");

          KTApp.unblockPage();
        }
      });
    });

    $('#locked_content_div').hide();
    //check if the channel already selected when document ready
    $('#collectible_lock_status option').each(function () {
      if ($(this).is(':selected')) {
        managelockedFieldProperties(this);
      }
    });

    $("#collectible_lock_status").on("change", function () {
      managelockedFieldProperties(this);
    });

    function managelockedFieldProperties(selectObject) {
      if (selectObject.value == "1") {
        $("#locked_content_div").show();
        validator.enableValidator("locked_content");
      } else {
        $("#locked_content_div").hide();
        $("#locked_content").val('');
        validator.disableValidator("locked_content");
      }
    }
  };

  return {
    // public functions
    init: function () {
      _initDemo1();
    }
  };
}();