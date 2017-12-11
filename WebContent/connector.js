(function () {
  // mstr is a global object from mstrgdc-1.0.js, which represents the data
  // connector framework
  var myConnector = mstr.createDataConnector();
  // Connector must define fetchTable function
  myConnector.fetchTable = function (table, params, doneCallback) {}
  mstr.validateDataConnector(myConnector);
})();

// Create event listener for when the user submits the form

function uuidv4() {
	  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
	    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
	  )
	}

$(document).ready(function () {
	$("#upload_form").submit(function(e) {
		var formData = new FormData(this);
		e.preventDefault();
		var uuid = uuidv4();
		var progress = function(e) {
			if (e.lengthComputable) {
				var percentage = Math.round(e.loaded / e.total * 100);
				$("#progress_bar").css("width", percentage + "%").attr('aria-valuenow', percentage).text(percentage + "%");
				if (percentage >= 100) {
					$("#progress_bar").removeClass("progress-bar-info").addClass("progress-bar-success");
				}
			}
		}

		$.ajax({
			type : 'POST',
			url : 'upload?uuid=' + encodeURIComponent(uuid) + '&stylesheet=' + encodeURIComponent($("#stylesheet :selected").val()),
			data : formData,
			xhr : function() {
				var myXhr = $.ajaxSettings.xhr();
				if (myXhr.upload) {
					myXhr.upload.addEventListener('progress', progress, false);
				}
				return myXhr;
			},
			cache : false,
			contentType : false,
			processData : false
		}).done(function(error, data) {
		    mstr.connectionName = "XMLImporter";
		    var url = new URL(window.location.href);
		    var dataUrl = url.origin + url.pathname + "consume?uuid=" + uuid;
		    mstr.fetchURL = dataUrl; 
		    mstr.tableList = [];
		    mstr.tableList.push({ tableName: $("#tableName").val() });

		    // Inform that interactive phase is finished and send information to MSTR
		   window.mstr.submit();
		});

	})
});