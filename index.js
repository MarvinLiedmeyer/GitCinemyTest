import {TXT_CORRECT, TXT_WIN, URL_CALL, URL_OFFSITE_MAP } from "./stringsURLs.js" ;

(function (tappProject, chayns, window, undefined) {
    'use strict';
    //-----------------------------------------------  Offline  ----------------------------------

    if (navigator.serviceWorker) navigator.serviceWorker.register('off.js');

    //--------------------------------------------------------------------------------------------
    //-----------------------------------------------  Timer  ------------------------------------

    let $closeTimer = document.querySelector('.closeTimer');
    let $losTimer = document.querySelector('.losTimer');

    //--------------------------------------------------------------------------------------------
    //-----------------------------------------------  Container  --------------------------------

    let $quiz = document.querySelector('#quiz');
    let $q1 = document.querySelector('#q1');
    let $q2 = document.querySelector('#q2');
    let $q3 = document.querySelector('#q3');
    let $q4 = document.querySelector('#q4');
    let $result = document.querySelector('#result');
    let $end = document.querySelector('#end');
    let $trailer = document.querySelector('.tapp-trailer');

    //--------------------------------------------------------------------------------------------
    //-------------------------------------------  Buttons  --------------------------------------

    let $btnQuiz = document.querySelector('.btnQuiz');
    let $btnQ1 = document.querySelector('.btnQ1');
    let $btnQ2 = document.querySelector('.btnQ2');
    let $btnQ3 = document.querySelector('.btnQ3');
    let $btnQ4 = document.querySelector('.btnQ4');
    let $btnResult = document.querySelector('.btnResult');
    let $happy = document.querySelector('.happy');
    let $callButton = document.querySelector('._callme');
    let $routeButton = document.querySelector('.routeButton');

    //--------------------------------------------------------------------------------------------
    //-------------------------------------------  Timer -----------------------------------------

    const endwin = new Date('Aug 14, 2019 23:59:59').getTime();

    //--------------------------------------------------------------------------------------------
    //-------------------------------------------  Array  ----------------------------------------

    const $visibleElements = [$trailer, $btnQuiz, $q1, $q2, $q3, $q4, $result, $end];

    //--------------------------------------------------------------------------------------------

    tappProject.init = function init(data) {

        chayns.ready.then(() => {
            _timeIntervals();

            //-------------------------------------------  AddEventListener  ---------------------

            $btnQuiz.addEventListener('click', () => {
                $quiz.style.display = 'block';
                _showElement($q1);
            });
            $callButton.addEventListener('click', () => { _callme() });
            $routeButton.addEventListener('click', () => { _calculateRoute() });
            $btnQ1.addEventListener('click', () => { _showElement($q2); _res($q1) });
            $btnQ2.addEventListener('click', () => { _showElement($q3); _res($q2) });
            $btnQ3.addEventListener('click', () => { _showElement($q4); _res($q3) });
            $btnQ4.addEventListener('click', () => { _showElement($result); _res($q4) });
            $btnResult.addEventListener('click', () => { _showElement($end); _end() });
            

            //------------------------------------------------------------------------------------
            //-------------------------------------------  Schonmal teilgenommmen?  --------------

            if (chayns.env.user.isAuthenticated) {
                if (chayns.utils.ls.get('skill') == 1) {
                    _showElement($end);
                    _setEndScreen(1);
                }
                else if (chayns.utils.ls.get('skill') == 2) {
                    _showElement($end);
                    _setEndScreen(2);
                }
            }
        })  //------------------------------------------------------------------------------------
    };//---------------------------------------------------  Anzeige/Versteckt  ------------------
    
    function _showElement(element) {
        for (let index = 0; index < $visibleElements.length; index++) {
            let item = $visibleElements[index];

            if (item === element) {
                item.style.display = 'block';
            }
            else {
                item.style.display = 'none';
            }
        }
    }//--------------------------------------------------------------------------------------------
    //---------------------------------------------------  FrageErgebnisse  -----------------------

    var correct = 0;
    function _res(element) {
        var z = element.querySelector('input.question:checked').value;
        switch (z) {
            case '1':
                correct++;
                break;
            default:
                break;
        }
    }//---------------------------------------------------------------------------------------------
    //---------------------------------------------------  InterComMessage => helper function  -----

    function _newLos() {
        console.log("=============================");
        // send application 
        chayns.intercom.sendMessageToPage({
            text: `${'Neues Los:'}
                    ${'Name:'} ${chayns.env.user.name} 
                    ${'ID: '} ${chayns.env.user.id}
                    ${'Frage 1:'} ${document.querySelector('input[name="frage1"]:checked').value}
                    ${'Frage 2:'} ${document.querySelector('input[name="frage2"]:checked').value}
                    ${'Frage 3:'} ${document.querySelector('input[name="frage3"]:checked').value}
                    ${'Frage 4:'} ${document.querySelector('input[name="frage4"]:checked').value}`
        })

    }//----------------------------------------------------------------------------------------------
    //----------------------------------------------------  QuizErgebnis  ---------------------------

    async function _end() {
        if (!chayns.env.user.isAuthenticated) {
            chayns.addAccessTokenChangeListener(() => {
                _newLos();
            });
            await chayns.login();
        }
        if (correct < 2) {
            chayns.utils.ls.set('skill', 1);
            _setEndScreen(1);
            _newLos();
        }
        else if (correct >= 2) {
            chayns.utils.ls.set('skill', 2);
            _setEndScreen(2);
            _newLos();
        }
    }//-----------------------------------------------------------------------------------------------
    //-----------------------------------------------------  EndScreen  ------------------------------

    function _setEndScreen(skill) {
        $quiz.style.display = 'block';
        if (skill == 1) {
            $happy.innerHTML = `${'Du hast ' + correct + TXT_CORRECT} ${chayns.env.user.firstName + '!'}`;
        }
        else if (skill == 2) {
            $happy.innerHTML = `${TXT_WIN} ${chayns.env.user.firstName + '!'}`;
        }
    }//------------------------------------------------------------------------------------------------
    //-------------------------------------------  Timer function => helper function  -----------------

    function _timeIntervals() {
        setInterval(function () {
            _setTimer($closeTimer, endwin);
        }, 1000)
    };

    //-------------------------------------------  Timer  => helper function  -------------------------

    function _setTimer(pTimer, targetDate) {
        let currentDate = new Date().getTime();
        let timeDistance = targetDate - currentDate;
        let days = Math.floor(timeDistance / (1000 * 60 * 60 * 24));
        let hours = Math.floor((timeDistance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let minutes = Math.floor((timeDistance % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((timeDistance % (1000 * 60)) / 1000);
        pTimer.innerHTML = 'Anmeldeschluss: ' + days + 'd ' + hours + 'h ' +
            minutes + 'm ' + seconds;
    };
    //-------------------------------------------------------------------------------------------------
    //--------------------------------------------  Anrufen => helper function  -----------------------

    function _callme() {
        window.open(URL_CALL);

    }//------------------------------------------------------------------------------------------------
    //--------------------------------------------  GoogleMaps => helper function  --------------------

    async function _calculateRoute() {
        chayns.showWaitCursor();
        let _location;
        let _url;

        try {
            _location = await promiseTimeout(2000, chayns.getGeoLocation());
            _url = `https://www.google.com/maps/dir/?api=1&origin=${_location.latitude},${_location.longitude}&destination=offsite+Ahaus`
        } catch (e) {
            _url = URL_OFFSITE_MAP;
        }

        chayns.hideWaitCursor();
        window.open(_url);

    }//------------------------------------------------------------------------------------------------

})((window.tappProject = {}), chayns, window);
tappProject.init();


