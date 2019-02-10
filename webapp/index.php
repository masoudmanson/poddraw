<?php
include "../config.php";
session_start();

function checkToken($access_token)
{
    global $config;
    $url = $config['core'] . 'nzh/getUserProfile';
    $ch = curl_init($url);

    //TODO : remove this shit
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["_token_:{$access_token}", "_token_issuer_:1"]);

    $response = curl_exec($ch);
    if ($response === false) {
        throw new Exception(curl_error($ch), curl_errno($ch));
    } else {
        $response = json_decode($response);

        if ($response->hasError) {
            // Client Not Authenticated => REFRESH TOKEN
            if ($response->errorCode == 21) {

                unset($_SESSION['access_token']);

                $url = $config['sso'] . '/token/';
                $ch = curl_init($url);

                //TODO : remove this hit
                curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);

                $fields = "client_id=" . $config['client_id'] . "&client_secret=" . $config['client_secret'] . "&refresh_token=" . $_SESSION['refresh_token'] . "&grant_type=refresh_token";

                curl_setopt($ch, CURLOPT_POSTFIELDS, $fields);
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/x-www-form-urlencoded'));

                $response = curl_exec($ch);

                if ($response === false) {
                    throw new Exception(curl_error($ch), curl_errno($ch));
                } else {
                    // Update SESSION to set new Access Token
                    $response = json_decode($response);

                    if ($response->access_token) {
                        $_SESSION['access_token'] = $response->access_token;
                        header("Location: {$config['home']}index.php");
                    } else if ($response->error) {
                        if (isset($_SESSION['keylead_code'])) {
                            unset($_SESSION['access_token']);
                            unset($_SESSION['refresh_token']);
                            unset($_SESSION['keylead_code']);
                        }
                        session_destroy();
                        header("Location: {$config['sso']}logout/");
                    }
                }
            }
        } else {
            return $response->result->profileImage;
        }
    }
    curl_close($ch);
}

if (isset($_SESSION['access_token'])) {
    $userProfileImage = checkToken($_SESSION['access_token']);
    if($userProfileImage) {
        ?>
        <!--[if IE]>
        <meta http-equiv="X-UA-Compatible" content="IE=5,IE=9"><![endif]-->
        <!DOCTYPE html>
        <html>

        <head>
            <title>PodDraw</title>
            <meta charset="utf-8">
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <meta name="Description"
                  content="draw.io is free online diagram software for making flowcharts, process diagrams, org charts, UML, ER and network diagrams">
            <meta name="Keywords" content="diagram, online, flow chart, flowchart maker, uml, erd">
            <meta itemprop="name" content="PodDraw - free flowchart maker and diagrams online">
            <meta itemprop="description" content="PodDraw is a free online diagramming application and flowchart maker . You can use it to create UML, entity relationship,
		org charts, BPMN and BPM, database schema and networks. Also possible are telecommunication network, workflow, flowcharts, maps overlays and GIS, electronic
		circuit and social network diagrams.">
            <meta itemprop="image"
                  content="https://lh4.googleusercontent.com/-cLKEldMbT_E/Tx8qXDuw6eI/AAAAAAAAAAs/Ke0pnlk8Gpg/w500-h344-k/BPMN%2Bdiagram%2Brc2f.png">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <meta name="msapplication-config" content="images/browserconfig.xml">
            <meta name="mobile-web-app-capable" content="yes">
            <meta name="theme-color" content="#d89000">
            <script type="text/javascript">
                /**
                 * URL Parameters and protocol description are here:
                 *
                 * https://desk.draw.io/support/solutions/articles/16000042546-what-url-parameters-are-supported
                 *
                 * Parameters for developers:
                 *
                 * - dev=1: For developers only
                 * - test=1: For developers only
                 * - drawdev=1: For developers only
                 * - export=URL for export: For developers only
                 * - ignoremime=1: For developers only (see DriveClient.js). Use Cmd-S to override mime.
                 * - createindex=1: For developers only (see etc/build/README)
                 * - filesupport=0: For developers only (see Editor.js in core)
                 * - savesidebar=1: For developers only (see Sidebar.js)
                 * - pages=1: For developers only (see Pages.js)
                 * - lic=email: For developers only (see LicenseServlet.java)
                 * --
                 * - networkshapes=1: For testing network shapes (temporary)
                 */
                var urlParams = (function() {
                    var result = new Object();
                    var params = window.location.search.slice(1).split('&');

                    for (var i = 0; i < params.length; i++) {
                        idx = params[i].indexOf('=');

                        if (idx > 0) {
                            result[params[i].substring(0, idx)] = params[i].substring(idx + 1);
                        }
                    }

                    return result;
                })();

                // Forces CDN caches by passing URL parameters via URL hash
                if (window.location.hash != null && window.location.hash.substring(0, 2) == '#P') {
                    try {
                        urlParams = JSON.parse(decodeURIComponent(window.location.hash.substring(2)));

                        if (urlParams.hash != null) {
                            window.location.hash = urlParams.hash;
                        }
                    }
                    catch (e) {
                        // ignore
                    }
                }

                // Redirects page if required
                if (urlParams['dev'] != '1') {
                    (function() {
                        var proto = window.location.protocol;

                        // Electron protocol is file:
                        if (proto != 'file:') {
                            var host = window.location.host;

                            // Redirects apex and rt to www
                            if (host === 'draw.io' || host === 'rt.draw.io') {
                                host = 'www.draw.io';
                            }

                            var href = proto + '//' + host + window.location.href.substring(
                                    window.location.protocol.length +
                                    window.location.host.length + 2);

                            // Redirects if href changes
                            if (href != window.location.href) {
                                window.location.href = href;
                            }
                        }
                    })();
                }

                /**
                 * Adds meta tags with application name (depends on offline URL parameter)
                 */
                (function() {
                    function addMeta(name, content) {
                        try {
                            var s = document.createElement('meta');
                            s.setAttribute('name', name);
                            s.setAttribute('content', content);

                            var t = document.getElementsByTagName('meta')[0];
                            t.parentNode.insertBefore(s, t);
                        }
                        catch (e) {
                            // ignore
                        }
                    };

                    var name = 'PodDraw';

                    if (urlParams['offline'] === '1') {
                        name += ' app';
                    }

                    addMeta('apple-mobile-web-app-title', name);
                    addMeta('application-name', name);
                })();
            </script>
            <link rel="apple-touch-icon" sizes="180x180" href="images/apple-touch-icon.png">
            <link rel="icon" type="image/png" sizes="32x32" href="images/favicon-32x32.png">
            <link rel="icon" type="image/png" sizes="16x16" href="images/favicon-16x16.png">
            <link rel="mask-icon" href="images/safari-pinned-tab.svg" color="#d89000">
            <link rel="stylesheet" type="text/css" href="styles/normalize.css">
            <link rel="stylesheet" type="text/css" href="styles/grapheditor.css">

            <link rel="manifest" href="images/manifest.json">
            <link rel="shortcut icon" href="favicon.ico">

            <script type="text/javascript" src="js/o.min.js"></script>
            <script type="text/javascript" src="js/hmi.js"></script>

            <style type="text/css">
                body {
                    overflow: hidden;
                }

                div.picker {
                    z-index: 10007;
                }

                .geSidebarContainer .geTitle {
                    color: #505050;
                }

                .geSidebarContainer .geTitle input {
                    font-size: 8pt;
                    color: #606060;
                }

                .geBlock {
                    z-index: -3;
                    margin: 100px;
                    margin-top: 40px;
                    margin-bottom: 30px;
                    padding: 20px;
                }

                .geBlock h1,
                .geBlock h2 {
                    margin-top: 0px;
                    padding-top: 0px;
                }

                .geEditor ::-webkit-scrollbar {
                    width: 12px;
                    height: 12px;
                }

                .geEditor ::-webkit-scrollbar-track {
                    background: whiteSmoke;
                    -webkit-box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.1);
                }

                .geEditor ::-webkit-scrollbar-thumb {
                    background: #c5c5c5;
                    border-radius: 10px;
                    border: whiteSmoke solid 3px;
                }

                .geEditor ::-webkit-scrollbar-thumb:hover {
                    background: #b5b5b5;
                }

                .geTemplate {
                    border: 1px solid transparent;
                    display: inline-block;
                    _display: inline;
                    vertical-align: top;
                    border-radius: 3px;
                    overflow: hidden;
                    font-size: 14pt;
                    cursor: pointer;
                    margin: 5px;
                }

                .geFooterContainer div.geSocialFooter a {
                    display: inline;
                    padding: 0px;
                }

                .geFooterContainer div.geSocialFooter a img {
                    margin-top: 10px;
                    opacity: 0.5;
                }

                .geFooterContainer div.geSocialFooter a img:hover {
                    opacity: 1;
                }

                .geFooterContainer > div#geFooter > img {
                    opacity: 0.5;
                    border: 1px solid transparent;
                    cusor: pointer;
                    margin-top: 3px;
                    margin-right: 6px;
                    position: absolute;
                    right: 4px;
                    top: 12px;
                    padding: 1px;
                    cursor: pointer;
                }

                .geFooterContainer > div#geFooter > img:hover {
                    opacity: 1;
                }
            </style>

            <!-- Workaround for binary XHR in IE 9/10, see App.loadUrl -->

            <!--[if (IE 9)|(IE 10)]><!-->
            <script type="text/vbscript">
    Function mxUtilsBinaryToArray(Binary)
				Dim i
				ReDim byteArray(LenB(Binary))
				For i = 1 To LenB(Binary)
					byteArray(i-1) = AscB(MidB(Binary, i, 1))
				Next
				mxUtilsBinaryToArray = byteArray
			End Function


            </script>
            <!--<![endif]-->

            <script type="text/javascript">
                /**
                 * Synchronously adds scripts to the page.
                 */
                function mxscript(src, onLoad, id, dataAppKey, noWrite) {
                    if (onLoad != null || noWrite) {
                        var s = document.createElement('script');
                        s.setAttribute('type', 'text/javascript');
                        s.setAttribute('src', src);
                        var r = false;

                        if (id != null) {
                            s.setAttribute('id', id);
                        }

                        if (dataAppKey != null) {
                            s.setAttribute('data-app-key', dataAppKey);
                        }

                        if (onLoad != null) {
                            s.onload = s.onreadystatechange = function() {
                                if (!r && (!this.readyState || this.readyState == 'complete')) {
                                    r = true;
                                    onLoad();
                                }
                            };
                        }

                        var t = document.getElementsByTagName('script')[0];
                        t.parentNode.insertBefore(s, t);
                    }
                    else {
                        document.write('<script src="' + src + '"' + ((id != null) ? ' id="' + id + '" ' : '') +
                            ((dataAppKey != null) ? ' data-app-key="' + dataAppKey + '" ' : '') + '></scr' + 'ipt>');
                    }
                };

                /**
                 * Asynchronously adds scripts to the page.
                 */
                function mxinclude(src) {
                    var g = document.createElement('script');
                    g.type = 'text/javascript';
                    g.async = true;
                    g.src = src;
                    var s = document.getElementsByTagName('script')[0];
                    s.parentNode.insertBefore(g, s);
                };

                // Checks for local storage
                var isLocalStorage = false;

                try {
                    isLocalStorage = urlParams['local'] != '1' && typeof(localStorage) != 'undefined';
                }
                catch (e) {
                    // ignored
                }

                var t0 = new Date();

                // Changes paths for local development environment
                if (urlParams['dev'] == '1') {
                    // Used to request grapheditor/mxgraph sources in dev mode
                    // var mxDevUrl = document.location.protocol + '//devhost.jgraph.com/mxgraph2';
                    //
                    // if (document.location.protocol == 'file:') {
                    //   mxDevUrl = '../../mxgraph2';
                    //
                    //   // Forces includes for dev environment in node.js
                    //   mxForceIncludes = true;
                    // }

                    mxDevUrl = 'mxgraph2';

                    var geBasePath = mxDevUrl + '/javascript/examples/grapheditor/www/js';
                    var mxBasePath = mxDevUrl + '/javascript/src';

                    // Used to request draw.io sources in dev mode
                    var drawDevUrl = '';

                    if (urlParams['drawdev'] == '1') {
                        drawDevUrl = document.location.protocol + '//drawhost.jgraph.com/';
                    }

                    mxscript(drawDevUrl + 'js/diagramly/Init.js');
                    mxscript(geBasePath + '/Init.js');
                    mxscript(mxDevUrl + '/javascript/src/js/mxClient.js');

                    // Adds all JS code that depends on mxClient. This indirection via Devel.js is
                    // required in some browsers to make sure mxClient.js (and the files that it
                    // loads asynchronously) are available when the code loaded in Devel.js runs.
                    mxscript(drawDevUrl + 'js/diagramly/Devel.js');
                }
                else {
                    mxscript('js/app.min.js');
                }

                // Electron
                if (window && window.process && window.process.type) {
                    mxscript('js/diagramly/ElectronApp.js');
                }

                // Adds basic error handling
                window.onerror = function() {
                    var status = document.getElementById('geStatus');

                    if (status != null) {
                        status.innerHTML = 'Page could not be loaded. Please try refreshing.';
                    }
                };
            </script>
        </head>

        <body class="geEditor">
        <div id="geInfo">
            <div class="geBlock" style="text-align:center;min-width:50%;">
                <h1>Flowchart Maker and Online Diagram Software</h1>
                <p>
                    PodDraw is free online diagram software.
                </p>
                <h2 id="geStatus">Loading...</h2>
                <p>
                    Please ensure JavaScript is enabled.
                </p>
            </div>
        </div>

        <script type="text/javascript">
            /**
             * Main
             */
            App.main(function() {
                document.getElementById("userProfileImage").src = "<?php echo $userProfileImage ?>";
            });
        </script>
        </body>

        </html>
        <?php
    }
} else {
    header("Location: {$config['home']}index.php");
}
?>