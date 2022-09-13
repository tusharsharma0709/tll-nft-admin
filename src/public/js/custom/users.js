jQuery(document).ready(function () {
  var users_table = $("#user_list").DataTable({
    //responsive: true,
    pagingType: "full_numbers",
    pageLength: 25,
    searching: false,
    language: {
      infoFiltered: "",
    },
    lengthChange: false,
    processing: true,
    serverSide: true,
    scrollX: true,
    ajax: {
      url: "/populateAllUsers",
      type: "POST",
      data: function (d) {
        d.user_wallet_address = $("#user_wallet_address").val(),
        d.user_status = $("#user_status").val()
      },
    },
    columnDefs: [
      { orderable: false, targets: 0 },
      {
        targets: 1,
        render: $.fn.dataTable.render.ellipsis(20)
      },
      /*{
        targets: 2,
        render: $.fn.dataTable.render.ellipsis(20)
      },*/
    ],
  });

  //search users table
  $("#search_user_list").on("click", function (e) {
    e.preventDefault();

    KTApp.blockPage({
      overlayColor: "#000000",
      state: "danger",
      message: "Please wait...",
    });
    users_table.ajax.reload();
    KTApp.unblockPage();
  });

  //change user status
  $(document).on("click", ".change_user_status", function (e) {
    e.preventDefault();

    var table = $("#user_list").DataTable();
    var id = $(this).data("id");
    var cmd = $(this).attr("data-cmd");

    switch (cmd) {
     
      case "ban":
        var alert_text = "Do You Really want to Ban this User?";
        var success_alert_text = "User Banned Successfully";
        break;
      
      case "unban":
        var alert_text = "Do You Really want to Un-ban this User?";
        var success_alert_text = "User Un-banned Successfully";
        break;
      
      default:
    }

    Swal.fire({
      title: "Are you sure?",
      html: alert_text,
      type: "warning",
      showCancelButton: true,
      confirmButtonText: "Confirm!",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      closeOnConfirm: false,
      reverseButtons: true,
    }).then((e) => {
      if (e.value) {
        KTApp.blockPage({
          overlayColor: "#000000",
          state: "danger",
          message: "Please wait...",
        });
        $.ajax({
          url: "/updateUserStatus",
          method: "POST",
          data: { id: id, cmd: cmd },
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
              icon: "success",
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

  
  //get curated artist list
  var curated_artist_table = $("#curated_artist_list").DataTable({
    //responsive: true,
    pagingType: "full_numbers",
    pageLength: 25,
    searching: false,
    language: {
      infoFiltered: "",
    },
    lengthChange: false,
    processing: true,
    serverSide: true,
    scrollX: true,
    ajax: {
      url: "/populateCuratedArtists",
      type: "POST",
      data: function (d) {
        d.user_wallet_address = $("#user_wallet_address").val(),
        d.user_status = $("#user_status").val()
      },
    },
    columnDefs: [
      { orderable: false, targets: 0 },
      {
        targets: 1,
        render: $.fn.dataTable.render.ellipsis(20)
      },
      {
        targets: 2,
        render: $.fn.dataTable.render.ellipsis(20)
      },
    ],
  });

  //update user curated status
  //change_curated_artist_status
  $(document).on("click", ".change_curated_artist_status", function (e) {
    e.preventDefault();

    var id = $(this).data("id");
    var cmd = $(this).attr("data-cmd");
    var user_public_address = $(this).attr("data-user_public_address");
    var action_from = $(this).attr("data-actionfrom");

    console.log("action from"+action_from);

    if(action_from=="curated_artist_list") {
      var table = $("#curated_artist_list").DataTable();
    } else {
      var table = $("#user_list").DataTable();
    }

    switch (cmd) {
      case "make_curated_artist":
        var alert_text = "Do You Really want to make this User as Curated Artist?";
        var success_alert_text = "User Added to Curated List Successfully";
        break;
      case "undo_curated_artist":
        var alert_text = "Do You Really want to Remove this User from Curated Artist List?";
        var success_alert_text = "User Removed from Curated Artist List Successfully";
        break;
      default:
    }

    Swal.fire({
      title: "Are you sure?",
      html: "Confirm Update User Status ?",
      type: "warning",
      showCancelButton: true,
      confirmButtonText: "Confirm!",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      closeOnConfirm: false,
      reverseButtons: true,
    }).then((e) => {
      if (e.value) {
        KTApp.blockPage({
          overlayColor: "#000000",
          state: "danger",
          message: "Please wait...",
        });
        $.ajax({
          url: "/updateCuratedArtistStatus",
          method: "POST",
          data: { id: id, cmd: cmd, user_public_address: user_public_address },
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
              icon: "success",
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


  //search curated artists
  $("#search_curated_user_list").on("click", function (e) {
  e.preventDefault();

  KTApp.blockPage({
    overlayColor: "#000000",
    state: "danger",
    message: "Please wait...",
  });
  curated_artist_table.ajax.reload();
  KTApp.unblockPage();
});
});
