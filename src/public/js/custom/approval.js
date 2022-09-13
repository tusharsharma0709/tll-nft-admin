jQuery(document).ready(function () {

    var users_table = $("#approval_list").DataTable({
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
        url: "/populateAllList",
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

    $(document).on("click", ".change_status", function (e) {
      e.preventDefault();
  
      var id = $(this).data("id");
      var cmd = $(this).attr("data-cmd");
      var user_public_address = $(this).attr("data-user_public_address");
      var action_from = $(this).attr("data-actionfrom");
  
      console.log("action from"+user_public_address);
  
      // if(action_from=="curated_artist_list") {
      //   var table = $("#curated_artist_list").DataTable();
      // } else {
      //   var table = $("#user_list").DataTable();
      // }
  
      // switch (cmd) {
      //   case "make_curated_artist":
      //     var alert_text = "Do You Really want to make this User as Curated Artist?";
      //     var success_alert_text = "User Added to Curated List Successfully";
      //     break;
      //   case "undo_curated_artist":
      //     var alert_text = "Do You Really want to Remove this User from Curated Artist List?";
      //     var success_alert_text = "User Removed from Curated Artist List Successfully";
      //     break;
      //   default:
      // }
  
      Swal.fire({
        title: "Are you sure?",
        html: "Approve User Status ?",
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
            url: "/updateListStatus",
            method: "POST",
            data: {cmd: cmd, user_public_address: user_public_address },
          }).done(function (res) {
            if (res.success) {
              console.log("id from ajax call is", res);
              window.location.reload();
              // if (table) {
              //   //KTApp.unblockPage();
              //   table.draw(false);
              //   //table.ajax.reload();
              // }
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
   


})

