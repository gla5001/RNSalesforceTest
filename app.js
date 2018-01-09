/*
 * Copyright (c) 2017-present, salesforce.com, inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided
 * that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of conditions and the
 * following disclaimer.
 *
 * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and
 * the following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 * Neither the name of salesforce.com, inc. nor the names of its contributors may be used to endorse or
 * promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    Button,
    AlertIOS,
    Image
} from 'react-native';

import MessageQueue from 'react-native/Libraries/BatchedBridge/MessageQueue'

import {StackNavigator} from 'react-navigation';
import {oauth, net} from 'react-native-force';

// MessageQueue.spy(true);

class UserListScreen extends React.Component {
    static navigationOptions = {
        title: 'Fallback',
        headerTitle: (
          <Image style={{ width: 50, height: 41}} source={require('./images/parker.png')}/>
        ),
        headerRight: (
          <Button title="Log Out" onPress={() => oauth.logout() } />
        )
    };

    constructor(props) {
        super(props);
        this.state = {data: []};
    }
    
    componentDidMount() {
        var that = this;
        oauth.getAuthCredentials(
            () => that.fetchData(), // already logged in
            () => {
                oauth.authenticate(
                    () => that.fetchData(),
                    (error) => console.log('Failed to authenticate:' + error)
                );
            });
    }

    fetchData() {
        var that = this;
        net.query('SELECT Id, Name, Player_Embed_URL__c FROM Video__c LIMIT 100',
                  (response) => that.setState({data: response.records})
                 );
    }

    clicked(id) {
        oauth.getAuthCredentials((creds) => {
            console.log(creds);
          const NamespacePrefix = '';
          const namespace = (NamespacePrefix ? '/' + NamespacePrefix.replace(/__/g, '') : '');
          const url = `${creds.instanceUrl}/services/apexrest${namespace}/UstudioRadio/video/${id}`;
          console.log(url);

          fetch(url, {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${creds.accessToken}`,
                Accept: 'application/json'
              }
          })
            .then(res => res.json())
            .then(resJson => {
                console.log(resJson);
              AlertIOS.alert(
                'SignedUrl',
                resJson
              );
            })
            .catch((err) => {
                console.log('fetch err: ' + err);
            })
        }, (err) => { console.log(err); });
    }

    render() {
        return (
            <View style={styles.container}>
              <FlatList
                data={this.state.data}
                renderItem={({item}) => <View><Text style={styles.item}>{item.Name}</Text><Text style={styles.item}>{item.Player_Embed_URL__c}</Text><Button title="get signed" onPress={() => this.clicked(item.Id) } /></View>}
                keyExtractor={(item, index) => index}
              />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 22,
        backgroundColor: 'white',
    },
    item: {
        padding: 5,
        fontSize: 14,
        height: 40,
    }
});

export const App = StackNavigator({
    UserList: { screen: UserListScreen }
});

