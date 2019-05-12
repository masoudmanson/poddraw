var APPLICATION_OWNER = 'fanitoring';

var oDataConfig = {
        fanitoring: {
            url: 'http://172.16.110.47:8080/report35/odata2.svc/',
            collections: {
                tagId: {
                    name: 'Sensor Ids',
                    service: 'GetSensorServices',
                    attribute: 'tagId'
                }
            }
        }
    },
    reservedNames = ['tagId'];

var oDataRequest = function(params, callback) {
    var url = params.url,
        query = params.query,
        format = params.format,
        token = window.ACCESS_TOKEN;

    if (token) {
        /**
         * Ajax Method
         */
        jQuery.ajax({
            url: url + '?' + ((query != undefined) ? query : '') + ((format != undefined) ? '$format=' + format : '$format=json') + '&$token=' + token,
            type: 'GET',
            crossDomain: true,
            success: function(response) {
                var data = JSON.parse(response);

                callback && callback({
                    hasError: false,
                    data: data
                });
            },
            error: function(xhr, status) {
                mxUtils.alert(xhr.responseJSON.error.message.value);
                console.log(xhr.responseJSON.error.message);
            }
        });

        /**
         * oData Method
         */
        // o(url + '?' + ((query != undefined) ? query : '') + ((format != undefined) ? '$format=' + format : '$format=json') + '&$token=' + token, {
        //     headers: new Headers({
        //         "Access-Control-Allow-Origin": "*",
        //     }),
        // })
        //     .get(function(data) {
        //         callback && callback({
        //             hasError: false,
        //             data: data
        //         });
        //     }, function(status) {
        //         callback && callback({
        //             hasError: true,
        //             errorCode: status
        //         });
        //     });

        /**
         * JSONP Method
         */
        // var s = document.createElement("script");
        // s.src = url + '?' + ((query != undefined) ? query : '') + ((format != undefined) ? '$format=' + format : '$format=json') + '&$token=' + token;
        // document.body.appendChild(s);
    }
    else {
        callback && callback({
            hasError: true,
            errorCode: 402,
            errorMessage: 'Invalid Authentication Token!'
        });
    }
};
