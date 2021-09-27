(function($) {
    "use strict";
    window.debug_track = false;
    $(document).ready(function () {
        elementor_setup_tracking($);
    });

})( jQuery );



function elementor_tracker_aw_conversion_callback() {
    "use strict";
    if(window.debug_track) {
        console.info('[Elementor-Tracker] - elementor_tracker_aw_conversion_callback() called');
    }
}
function elementor_setup_tracking($) {
    "use strict";
    function setup_popup_tracking() {
        setTimeout(function () {
            var hasDocumentManager = (elementorFrontend && elementorFrontend.documentsManager && elementorFrontend.documentsManager.documents);
            if(hasDocumentManager) {
                $.each(elementorFrontend.documentsManager.documents, (id, document) => {
                    if ( document.getModal ) {
                        document.getModal().on( 'show', () => {
                            var elementsSelector = $('*[data-elementor-id="' + id +  '"]');
                            var selectedModal = $(elementsSelector[0]); 
                            $('.elementor-trackable', selectedModal).each(function () {
                                var trackerData = $(this).data('elementor-tracker');
                                setupTracking(this, trackerData);
                            });
                        });
                    }
                });
            }
        }, 200);
    }
    function log(str) {
        if(window.debug_track) {
            console.info('[Elementor-Tracker] - ' + str);
        }
    }
    function trackFacebook(type, event, source) {
        log("fbq('" + type + "', '" + event + "')");
        if(window.fbq && typeof(fbq) === 'function') {
            fbq(type, event);
        } else {
            console.error('Error tracking facebook event, fbq is not defined');
        }
    }
    function trackGa(category, action, label, source) {
        var eventAttr = {
            eventCategory: category,
            eventAction: action,
            eventLabel: label,
        };
        if(window.ga && typeof(ga) === 'function') {
            if(window.ga.getAll) {
                var trackers = window.ga.getAll();
                trackers.forEach(function (tracker) {
                    try {
                        var trackerDataKey = Object.keys(tracker).find(function (x) { return tracker[x]['data'] });
                        var trackerName = tracker[trackerDataKey].data.values[':name'];
                        log("ga('send', 'event', " + JSON.stringify(eventAttr) + ')');
                        ga(trackerName + '.' + 'send', 'event', eventAttr);
                    } catch (err) {
                        console.error('GA: cannot get trackers name, sending event to ga default');
                        ga('send', 'event', eventAttr);
                    }
                });
            } else {
                ga('send', 'event', eventAttr);
            }
        } else {
            console.error('Error tracking GA event, ga is not defined');
        }
    }
    function trackGtag(eventName, source) {
        log("gtag('event', '" + eventName + "', {})");
        if(window.gtag && typeof(gtag) === 'function') {
            gtag('event', eventName, {});
        } else {
            console.error('Error tracking Gtag event, gtag is not defined');
        }
    }
    function trackAwConversion(awConversion, source) {
        log("gtag('event', 'conversion', { 'send_to': '" + awConversion + "', 'event_callback': callback })");
        if(window.gtag && typeof(gtag) === 'function') {
            gtag('event', 'conversion', {
                'send_to': awConversion,
                'event_callback': elementor_tracker_aw_conversion_callback,
            });
        } else {
            console.error('Error tracking Gtag event, gtag is not defined');
        }
    }
    function trackElement(element, options) {
        if(options['track-fb-event']) {
            var event = options['fb-event'];
            if(event === 'Custom') {
                var customEvent = options['fb-event-custom'];
                trackFacebook('trackCustom', customEvent, element);
            } else {
                trackFacebook('track', event, element);
            }
        }
        if(options['track-ga-event']) {
            var category = options['ga-cat'];
            var action = options['ga-action'];
            var label = options['ga-label'];
            trackGa(category, action, label, element);
        }
        if(options['track-gtag-event']) {
            var eventName = options['gtag-event-name'];
            trackGtag(eventName, element);
        }
        if(options['track-aw-conv']) {
            var conversionName = options['aw-conv'];
            trackAwConversion(conversionName, element);
        }
    }
    function setupTracking(element,trackerData) {
        if ($(element).find('form').length > 0) {
            $(document).on('submit_success', function(e) {
                var target = e.target;
                var isCurrentForm = $(element).find(target).length === 1;
                if(isCurrentForm) {
                    trackElement(target, trackerData);
                }
            });
        } else if($(element).find('a').length > 0)  {
            $(element).find('a').each(function () {
                $(this).on('click', function () {
                    trackElement(this, trackerData);
                });
            });
        } else {
            $(element).on('click', function () {
                trackElement(this, trackerData);
            });
        }
    }
    
    $('.elementor-trackable').each(function () {
        var trackerData = $(this).data('elementor-tracker');
        setupTracking(this, trackerData);
    });
    setup_popup_tracking();
}