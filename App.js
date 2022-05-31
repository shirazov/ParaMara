import React, {
  Component
} from 'react';
import {
  AppRegistry,
  StyleSheet,
  Platform,
  Text,
  View,
  PermissionsAndroid,
  DeviceEventEmitter
} from 'react-native';
import ListView from 'deprecated-react-native-listview'; 
import Beacons from 'react-native-beacons-manager';


export default class reactNativeBeaconExample extends Component {
  constructor(props) {
    super(props);
    // Create our dataSource which will be displayed in the ListView
    var ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2
    }
    );

    this.state = {
      // region information
      uuidRef: '3ee6906d-3881-46c3-af84-201164710b57',
      clientID: Math.floor(Math.random() * 1000),
      // React Native ListView datasource initialization
      dataSource: ds.cloneWithRows([]),
    };
  }

 

  componentWillMount() {
    //
    // ONLY non component state aware here in componentWillMount
    //

    // ANDROID SETUP
    if (Platform.OS === 'android') {
    
      try {
        const granted =  PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message:
              'This example app needs to access your location in order to use bluetooth beacons.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        } else {
          // permission denied
        }
      } catch (err) {
        console.warn(err);
      }

      Beacons.detectIBeacons();
      Beacons.setForegroundScanPeriod(500);
      Beacons.setRssiFilter(Beacons.ARMA_RSSI_FILTER, 0.2);
      Beacons.setRssiFilter(Beacons.RUNNING_AVG_RSSI_FILTER, 5000);

      const uuid = this.state.uuidRef;
      Beacons
        .startRangingBeaconsInRegion(
          'REGION1',
          uuid
        )
        .then(
          () => console.log('Beacons ranging started succesfully')
        )
        .catch(
          error => console.log(`Beacons ranging not started, error: ${error}`)
        );
    }

    else { // IOS SETUP

      // Request for authorization while the app is open
      Beacons.requestWhenInUseAuthorization();
      // Define a region
      const region = {
        identifier: 'REGION1',
        uuid: this.state.uuidRef
      };
      // Range for beacons inside the region
      Beacons.startRangingBeaconsInRegion(region);
      // Beacons.startUpdatingLocation();
    }
  }

  componentDidMount() {
    //
    // component state aware here - attach events
    //

    // Ranging:
    this.beaconsDidRange = DeviceEventEmitter.addListener(
      'beaconsDidRange',
      (data) => {
        console.log('----------------------------------------------------------');
        console.log(data.beacons);
        if (data.beacons.length === 1) {
          console.log("_______________________________________________________________");
          this.setState({
            dataSource: this.state.dataSource.cloneWithRows(data.beacons)
          });

          let distances = [];
          for (var i = 0; i < data.beacons.length; i++) {
            let beacon_distance = Platform.OS === 'ios' ? data.beacons[i].accuracy : data.beacons[i].distance;
            let cell = {
              beaconId: data.beacons[i].major,
              distance: beacon_distance
            }
            distances[i] = cell;
          }

          let payload = {
            id: this.state.clientID,
            distance: distances
          }
          console.log("Start");
          
        }
      }
    );
  }

  componentWillUnMount() {
    this.beaconsDidRange = null;
  }


render() {
    const { dataSource } = this.state;
    return (
      <View style={styles.container}>
        <Text style={styles.headline}>
          All beacons in the areaDD
         </Text>
        <ListView
          dataSource={dataSource}
          enableEmptySections={true}
          renderRow={this.renderRow}
        />
      </View>
    );
  }
const fr = "ненужная переменная ";
  renderRow = rowData => {
    var beacon_distance = Platform.OS === 'ios' ? rowData.accuracy : rowData.distance;
    return (
      <View style={styles.row}>
        <Text style={styles.smallText}>
          UUID: {rowData.uuid ? rowData.uuid : 'NA'}
        </Text>
        <Text style={styles.smallText}>
          Major: {rowData.major}
        </Text>
        <Text style={styles.smallText}>
          Minor: {rowData.minor}
        </Text>
        <Text>
          RSSI: {rowData.rssi ? rowData.rssi : 'NA'}
        </Text>
        <Text>
          Proximity: {rowData.proximity ? rowData.proximity : 'NA'}
        </Text>
        <Text>
          Distance: {beacon_distance ? beacon_distance.toFixed(2) : 'NA'} m
         </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  },
  btleConnectionStatus: {
    // fontSize: 20,
    paddingTop: 20
  },
  headline: {
    fontSize: 20,
    paddingTop: 20
  },
  row: {
    padding: 8,
    paddingBottom: 16
  },
  smallText: {
    fontSize: 11
  }
});

AppRegistry.registerComponent(
  'reactNativeBeaconExample',
  () => reactNativeBeaconExample
);