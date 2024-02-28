import React, { useEffect } from 'react';
//import { Identify, groupIdentify, identify, setGroup, track,} from '@amplitude/analytics-browser';

function Other() {
  useEffect(() => {
    (window as any).amplitude.track('Page View', {
      name: 'Other',
    });
  }, []);
  /*
  <button onClick={() => identify(new Identify().set('role', 'engineer'))}>
        Identify
    </button>
    <button onClick={() => setGroup('org', 'engineering')}>
        Group
    </button>
    <button onClick={() => groupIdentify('org', 'engineering', new Identify().set('technology', 'react.js'))}>
          Group Identify
    </button>
*/
  return (
    <div>
    <h1>Test other functions here</h1>
    

    </div>

  );
}

export default Other;
