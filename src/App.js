import React, {Component} from 'react'
import {Text, View, TouchableOpacity, TextInput, ScrollView, ListView} from 'react-native'
import {mediaDevices, RTCIceCandidate, RTCPeerConnection, RTCSessionDescription, RTCView, RTCSetting} from 'react-native-webrtc';
let otherUsername = null;
let localStream;
let sendChannel;
let receiveChannel;

const ws = new WebSocket('ws://172.16.16.41:9090')
ws.onopen = () => {
    console.log('Connected to the signaling server')
}

ws.onerror = err => {
    console.log(err)
}

class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            streamURL: null,
            remoteURL: null,
            remote: '',
            name: '',
            remoteUserName: '',
            ptpMsg : '',
            recievedMsg : ''
        }
    }

    componentDidMount(){
        const configuration = {
            iceServers: [
                {
                    url: 'stun:stun2.1.google.com:19302'
                }
            ]
        }
        connection = new RTCPeerConnection(configuration);
        sendChannel = connection.createDataChannel('sendDataChannel');
        appClass = this;
    } 

    componentWillUpdate(){
        ws.onmessage = msg => {
            console.log('Got message', msg.data)
        
            const data = JSON.parse(msg.data)
            console.log("Type of data is ====> ", data.type)
            switch (data.type) {
                case 'login':
                    this.handleLogin(data.success)
                    break
                case 'offer':
                    this.handleOffer(data.offer, data.name)
                    console.log('Handle offer got data', data.offer, data.name)
                    break
                case 'answer':
                    this.handleAnswer(data.answer)
                    break
                case 'candidate':
                    this.handleCandidate(data.candidate)
                    break
                case 'close':
                    this.handleClose()
                    break
                default:
                    break
            }
        } 
    }

    loginPressed = () => {
        (this.state.name).length < 0 && alert('Please enter a username 🙂')
        console.log("*************************",this.state.name);
        this.sendMessage({
            type: 'login',
            name: this.state.name
          })
    }

    handleLogin = async success => {
        if (success === false) {
            alert('😞 Username already taken')
        } else {            
            let isFront = true;
            mediaDevices
                .enumerateDevices()
                .then(sourceInfos => {
                    console.log(sourceInfos);
                    let videoSourceId;
                    for (let i = 0; i < sourceInfos.length; i++) {
                        const sourceInfo = sourceInfos[i];
                        if (sourceInfo.kind == "video" && sourceInfo.facing == (isFront
                            ? "front"
                            : "back")) {
                            videoSourceId = sourceInfo.id;
                        }
                    }
                    mediaDevices.getUserMedia({
                        audio: true,
                        video: {
                            mandatory: {
                                minWidth: 200, 
                                minHeight: 300,
                                minFrameRate: 60
                            },
                            facingMode: (isFront
                                ? "user"
                                : "environment"),
                            optional: (videoSourceId
                                ? [
                                    {
                                        sourceId: videoSourceId
                                    }
                                ]
                                : [])
                        }
                    }).then(stream => {
                        localStream = stream;
                        
                        appClass.setState({
                            streamURL: stream.toURL(),
                        });
            
                        connection.addStream(stream)

                        connection.onaddstream = event => {
                            this.setState({remoteURL: event.stream.toURL()})
                        }

                        connection.onicecandidate = event => {
                            if (event.candidate) {
                                this.sendMessage({type: 'candidate', candidate: event.candidate})
                            }
                        }
                        connection.ondatachannel = event => {
                            console.log('Receive Channel Callback');
                            receiveChannel = event.channel;
                            receiveChannel.onmessage = this.onReceiveMessageCallback;
                        }      
                        console.log('call back executed');
                    }).catch(error => {
                        console.log(error);
                    });
                });

        }
    }

    callPressed = () => {
        const callToUsername = this.state.remoteUserName;
        
        if (callToUsername.length === 0) {
            alert('Enter a username 😉')
            return
        }

        otherUsername = callToUsername

        connection.createOffer().then(offer => {
            this.sendMessage({
                type: 'offer',
                offer: offer
              })

            connection.setLocalDescription(offer)
        });
    }
    
    endCallPressed = () => {
        this.sendMessage({type: 'close'})
        this.handleClose();
    }

    sendPressed = () => {
        const data = this.state.ptpMsg;
        sendChannel.send(data);
        console.log('Sent Data: ' + data);
    }
    sendMessage = message => {
        if (otherUsername) {
          message.otherUsername = otherUsername
        }
      
        ws.send(JSON.stringify(message))
        console.log('sendMessage Called');
    }

    handleOffer = (offer, name) => {
        otherUsername = name
        connection.setRemoteDescription(new RTCSessionDescription(offer))
        connection.createAnswer().then(answer => {
            connection.setLocalDescription(answer)
            this.sendMessage({type: 'answer', answer: answer})
            console.log('handleOffer Called');

        }, error => {
            alert('Error when creating an answer')
            console.log(error)
        })
    }

    handleAnswer = answer => {
        connection.setRemoteDescription(new RTCSessionDescription(answer))
    }

    handleCandidate = candidate => {
        connection.addIceCandidate(new RTCIceCandidate(candidate))
    }

    receiveChannelCallback = event => {
        console.log('Receive Channel Callback');
        receiveChannel = event.channel;
        receiveChannel.onmessage = this.onReceiveMessageCallback;
    }      
    
    onReceiveMessageCallback = event => {
        console.log('Received Message');
        this.setState({recievedMsg: event.data })
    }

    handleClose = () => {
        otherUsername = null
        this.setState({remote: null},{streamURL: null},{remoteURL: null,})
        connection.close()
        connection.onicecandidate = null
        connection.onaddstream = null
    }

    render() {
        const {buttonContainer, buttonStyle, rtcView} = styles;
        
        return (
            <ScrollView>
                <View style={buttonContainer}>
                    <Text
                        style={{
                        fontSize: 30,
                        fontWeight: '700'
                    }}>
                        Healpha
                    </Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                    <TextInput
                        style={buttonStyle}
                        placeholder='Enter Username'
                        value={this.state.name}
                        onChangeText={(text) => this.setState({name: text})}/>
                <TouchableOpacity style={[buttonContainer]} onPress={() => this.loginPressed()}>
                    <Text style={buttonStyle}>Login</Text>
                </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row'}}>
                    <View
                        style={{
                        width: '50%',
                        height: 200,
                        borderColor: '#CCCCCC',
                        borderWidth: 1
                    }}>
                        <RTCView mirror={true} streamURL={this.state.streamURL!=undefined ? this.state.streamURL : null} style={rtcView}/>
                    </View>
                    <View
                        style={{
                        width: '50%',
                        height: 200,
                        borderColor: '#CCCCCC',
                        borderWidth: 1
                    }}>
                        <RTCView mirror={true} streamURL={this.state.remoteURL} style={rtcView}/>
                    </View>
                </View>
                
                <View style={{
                    flexDirection: 'row'
                }}>
                    <View style={{ width: '60%' }}>
                        <TextInput
                            style={{borderColor:'#000000', borderWidth: 1, borderRadius:8}}
                            placeholder='Enter Remote Username'
                            value={this.state.remoteUserName}
                            onChangeText={(text) => this.setState({remoteUserName: text})}/>
                    </View>
                    <View style={{
                        width: '20%'
                    }}>
                        <TouchableOpacity onPress={() => this.callPressed()}>
                            <Text style={[buttonStyle,{backgroundColor: '#228B22', color: '#ffffff'}]}>Call</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <View style={{
                        width: '20%'
                    }}>
                        <TouchableOpacity style={buttonContainer} onPress={() => this.endCallPressed()}>
                            <Text style={[buttonStyle, {backgroundColor: '#ff0000', color: '#ffffff'}]}>End Call</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{
                    flexDirection: 'row',
                    marginTop : 10
                }}>
                    <View style={{ width: '80%' }}>
                        <TextInput
                            style={{borderColor:'#000000', borderWidth: 1, borderRadius:8}}
                            placeholder='Enter Message'
                            value={this.state.ptpMsg}
                            onChangeText={(text) => this.setState({ptpMsg: text})}/>
                    </View>
                    <View style={{
                        width: '20%'
                    }}>
                        <TouchableOpacity onPress={() => this.sendPressed()}>
                            <Text style={[buttonStyle,{backgroundColor: '#228B22', color: '#ffffff'}]}>Send</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View>
                    <Text>{this.state.recievedMsg}</Text>
                </View>
                </ScrollView>
        )
    }
}
export default App;

const styles = {
    buttonContainer: {
        alignItems: 'center'
    },
    buttonStyle: {
        textAlign: 'center',
        borderWidth: 1,
        borderColor: 'black',
        margin: 5,
        padding: 10,
        borderRadius: 10
    },
    rtcView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 200,
        margin: 10
    }
};