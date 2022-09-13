jQuery(document).ready(function () {
  var sales_table = $('#sales_report').DataTable({
    //responsive: true,
    pagingType: 'full_numbers',
    "pageLength": 25,
    "searching": false,
    "language": {
      "infoFiltered": ""
    },
    "lengthChange": false,
    processing: true,
    serverSide: true,
    "scrollX": true,
    ajax: {
      url: '/populateAllSales',
      type: 'POST',
      data: function (d) {
        d.token_type = $('#token_type').val(), d.search_sale_by_tokenid = $('#search_sale_by_tokenid').val(), d.search_sale_by_token_address = $('#search_sale_by_token_address').val(), d.search_sale_by_buyer = $('#search_sale_by_buyer').val(), d.search_sale_by_seller = $('#search_sale_by_seller').val(), d.from_date = $('#from_date').val(), d.to_date = $('#to_date').val();
      }
    },
    columnDefs: [{ orderable: false, targets: 0 }, {
      targets: 4,
      render: $.fn.dataTable.render.ellipsis(10)
    }, {
      targets: 5,
      render: $.fn.dataTable.render.ellipsis(10)
    }, {
      targets: 6,
      render: $.fn.dataTable.render.ellipsis(10)
    }, {
      targets: 9,
      "render": function (data) {
        return moment(data).isValid() ? moment.utc(data).format("DD/MM/YYYY hh:mm:ss") : "-";
      }
    }]
  });

  //search sales table
  $('#search_sale').on('click', function (e) {
    e.preventDefault();

    KTApp.blockPage({
      overlayColor: '#000000',
      state: 'danger',
      message: 'Please wait...'
    });

    $('#token_type_export').val($('#token_type').val());
    $('#token_id_export').val($('#search_sale_by_tokenid').val());
    $('#token_address_export').val($('#search_sale_by_token_address').val());
    $('#seller_address_export').val($('#search_sale_by_seller').val());
    $('#buyer_address_export').val($('#search_sale_by_buyer').val());

    sales_table.ajax.reload();
    KTApp.unblockPage();
  });

  //export to excel button
  $('#reset_sale_search_form').on('click', function (e) {
    e.preventDefault();

    KTApp.blockPage({
      overlayColor: '#000000',
      state: 'danger',
      message: 'Please wait...'
    });
    $('#token_type').val('');
    $('#search_sale_by_tokenid').val('');
    $('#search_sale_by_token_address').val('');
    $('#search_sale_by_buyer').val('');
    $('#search_sale_by_seller').val('');
    $('#date_range').val('');
    $('#from_date').val('');
    $('#to_date').val('');

    sales_table.ajax.reload();

    KTApp.unblockPage();
  });

  // predefined ranges
  var start = moment().subtract(29, 'days');
  var end = moment();

  $('#kt_daterangepicker_6').daterangepicker({
    buttonClasses: ' btn',
    applyClass: 'btn-primary',
    cancelClass: 'btn-secondary',

    startDate: start,
    endDate: end,
    ranges: {
      'Today': [moment(), moment()],
      'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
      'Last 7 Days': [moment().subtract(6, 'days'), moment()],
      'Last 30 Days': [moment().subtract(29, 'days'), moment()],
      'This Month': [moment().startOf('month'), moment().endOf('month')],
      'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    }
  }, function (start, end, label) {
    $('#kt_daterangepicker_6 .form-control').val(start.format('DD-MM-YYYY') + ' / ' + end.format('DD-MM-YYYY'));
    $('#from_date').val(start.format('YYYY-MM-DD'));
    $('#to_date').val(end.format('YYYY-MM-DD'));
  });
});