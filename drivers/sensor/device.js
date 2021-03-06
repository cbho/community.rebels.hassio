'use strict';

const Homey = require( 'homey' );

const capability_type = {
  "alarm_smoke": 'boolean',
  "alarm_heat": 'boolean',
  "alarm_tamper": 'binary',
  "measure_temperature": 'floatvalue',
  "measure_humidity": 'intvalue',
  "measure_pressure": 'intvalue',
  "measure_battery": 'intvalue',
  "alarm_contact": 'boolean',
  "alarm_motion": 'boolean',
  "alarm_generic": 'switch'
};

const EventBus = require( 'eventbusjs' );

class SensorDevice extends Homey.Device {

  onInit() {

    let device_capability = this.getCapabilities();
    this.log('CAPABILITY FROM DEVICE: ', device_capability);

    //LOOP THROUGH CAPABILITIES
    Object.keys( device_capability ).forEach( ( key ) => {
      console.log(device_capability[ key ]);

      // SET CAPABILITIES ON INIT
      const capability = device_capability[ key ].toString();
      Homey.app.getState( eval(`this.getData().id_${capability}`) )
      .then( ( res ) => {
        this.log( 'DEVICE INIT - ' + eval(`this.getData().id_${capability}`) );
        this.log('NOW EXECUTING SETALLCAPABILITIES');
        this.setAllCapabilities( res, capability );
      } )
      .catch( err => {
               this.error('COULD NOT GET DATA FOR :', capability);
      } );

      // ADD EVENT LISTENER
      EventBus.addEventListener( eval(`this.getData().id_${capability}`), ( data ) => {
        this.log( data.target.entity_id + ' got an update!' );
        console.log( data.target.new_state.attributes );
        console.log(data.state);
        this.setAllCapabilities( data.target.new_state, capability );
      } );
    } )
  }

  setAllCapabilities( data, capability ) {

    //SET CAPABILITY
    console.log('LOG data: ', data);
    console.log('CAPABILITY: ', capability);
    console.log('data.state: ', data.state);

    for ( var type in capability_type ) {

      if ( capability === type ) {

        switch(capability_type[type]) {
          case "floatvalue":
            this.log(`${capability_type[type]} value changed for `, capability);
            this.setCapabilityValue( capability, parseFloat(data.state, 10) );
            break;
          case "intvalue":
            this.log(`${capability_type[type]} value changed for `, capability);
            this.setCapabilityValue( capability, parseInt(data.state, 10) );
            break;
          case "binary":
            this.log(`${capability_type[type]} value changed for `, capability);
            if ( parseInt(data.state) === 0 ) {
              this.setCapabilityValue( capability, false );
            }
            if ( parseInt(data.state) === 254 ) {
              this.setCapabilityValue( capability, true );
            }
            break;
          case "boolean":
            this.log(`${capability_type[type]} value changed for `, capability);
            if ( parseInt(data.state) === 0 ) {
              this.setCapabilityValue( capability, false );
            }
            if ( parseInt(data.state) === 1 ) {
              this.setCapabilityValue( capability, true );
            }
            break;
          case "switch":
            this.log(`${capability_type[type]} value changed for `, capability);
            if ( data.state === 'on' ) {
              this.setCapabilityValue( capability, true )
            }
            else {
              this.setCapabilityValue( capability, false )
            }
            break;
          default:
            this.log('Type not defined for ', capability);
        }
      }
    }

  }

}

module.exports = SensorDevice;
