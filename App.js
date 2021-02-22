import React, { useEffect, useState } from 'react';
import './App.css';
import {Subject} from 'rxjs';
import {filter, map, buffer, debounceTime} from 'rxjs/operators';


function App() {
  const [time, setTime] = useState(0);
  const [timeOn, setTimeOn] = useState(false);
  const [startStop, setStartStop] = useState(false);

  useEffect(() => {
    let interval = null;

    if (timeOn) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1)
      }, 1000);
    } else {
        clearInterval(interval);
      }
    return () => clearInterval(interval);
  }, [timeOn])

  const actions$ = new Subject();
  const waitAction$ = new Subject();  

  const start$ = actions$
    .pipe(filter(action => action === 'start'));
  const stop$ = actions$
    .pipe(filter(action => action === 'stop'));
  const wait$ = waitAction$.pipe(
    buffer(waitAction$.pipe(debounceTime(300))),
    map(list => {return list.length;}),
    filter(x => x === 2),);
  const reset$ = actions$
    .pipe(filter(action => action === 'reset'));

    start$.subscribe((vl) => setTimeOn(true) & setStartStop(true));
    stop$.subscribe((vl) => setTime(0) & setTimeOn(false) & setStartStop(false));
    wait$.subscribe((vl) => setTimeOn(false) & setStartStop(false));
    reset$.subscribe((vl) => setTime(0) & setTimeOn(true) & setStartStop(true));

    const display =<div className="h3">
    <span>{('0' + Math.floor((time / 3600) % 24)).slice(-2) + ': '}</span>
    <span>{('0' + Math.floor((time / 60) % 60)).slice(-2) + ': '}</span>
    <span>{('0' + (time % 60)).slice(-2)}</span>
    </div>

    return (
      <div className='App'>
        <h1>Timer</h1>
        <div className="display">{display}</div>
        <div className="btn-group" role="group" aria-label="Basic outlined example">
          <button className='btn btn-outline-dark' onClick={startStop ? 
            () => actions$.next('stop') : () => actions$.next('start')}>
            {startStop ? 'Stop' : 'Start'}
          </button>
          <button className='btn btn-outline-dark' onClick=
            {() => waitAction$.next('wait')}>
            Wait
          </button>
          <button className='btn btn-outline-dark' onClick=
          {() => actions$.next('reset')}>
          Resrt
        </button>
        </div>
      </div>
    );
  }

export default App;
