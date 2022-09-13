jQuery(document).ready(function () {
  var table = $("#auction_list").DataTable({
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
      url: "/populateAllAuctions",
      type: "POST",
      data: function (d) {
        d.search_collectible = $("#search_collectible").val(), d.token_type = $("#token_type").val(), d.filter_auction_status = $("#filter_auction_status").val(), d.search_collectible_by_artist = $("#search_collectible_by_artist").val(), d.collectible_featured_status = $("#filter_is_featured").val();
      }
    },
    columnDefs: [{ orderable: false, targets: 0 }, {
      targets: 3,
      render: $.fn.dataTable.render.ellipsis(15)
    }, {
      targets: 6,
      render: $.fn.dataTable.render.ellipsis(15)
    }]
  });

  $("#searchAuctionBtn").on("click", function (e) {
    e.preventDefault();

    KTApp.blockPage({
      overlayColor: "#000000",
      state: "danger",
      message: "Please wait..."
    });
    table.ajax.reload();
    KTApp.unblockPage();
  });

  //reset collectible filters
  $("#reset_auctions_search_form").on("click", function (e) {
    e.preventDefault();

    KTApp.blockPage({
      overlayColor: "#000000",
      state: "danger",
      message: "Please wait..."
    });
    $("#search_collectible").val("");
    $("#token_type").val("");
    $("#filter_auction_status").val("");
    $("#search_collectible_by_artist").val("");
    $("#filter_is_featured").val("");

    table.ajax.reload();

    KTApp.unblockPage();
  });

  //make/update featured auction status
  //
  //change collectible status
  $(document).on("click", ".change_auction_status", function (e) {
    e.preventDefault();

    var table = $("#auction_list").DataTable();
    var id = $(this).data("id");
    var cmd = $(this).attr("data-cmd");

    switch (cmd) {
      case "make_featured":
        var alert_text = "Do You Really want to Make this Auction Featured?";
        var success_alert_text = "Auction Successfully";
        break;
      case "undo_featured":
        var alert_text = "Do You Really want to Undo-Featured?";
        var success_alert_text = "Auction Undo-Featured Successfully";
        break;
      default:
    }

    Swal.fire({
      title: "Are you sure?",
      html: "Confirm Update Auction Featured Status ?",
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
          url: "/updateAuctionStatus",
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

  //view bids list
  //bids_list
  var bids_table = $("#bids_list").DataTable({
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
      url: "/populateBidsOfAuction",
      type: "POST",
      data: function (d) {
        d.auction_uuid = $("#auction_uuid").val(), d.filter_bid_status = $("#filter_bid_status").val(), d.search_collectible_by_artist = $("#search_collectible_by_artist").val();
      }
    },
    columnDefs: [{ orderable: false, targets: 0 }, {
      targets: 1,
      render: $.fn.dataTable.render.ellipsis(15)
    }]
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