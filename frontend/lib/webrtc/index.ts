import { EventEmitter } from "events";
import { iceServers } from "../../consts";

const CONFIGURATION = {
  'iceServers': iceServers
};

export interface IDeviceSettings {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  hasCameraAccess: boolean;
  hasMicrophoneAccess: boolean;
}

enum Events {
  DEVICE_UPDATED = "onDeviceUpdated"
}

type EventsType = `${Events}`;

class WebRTC extends EventEmitter {
  public _peerConnection: RTCPeerConnection;
  private _deviceSettings: IDeviceSettings;

  constructor() {
    super();
    this._peerConnection = new RTCPeerConnection(CONFIGURATION);
    this._deviceSettings = {
      localStream: null,
      remoteStream: null,
      hasCameraAccess: false,
      hasMicrophoneAccess: false,
    }
  }

  public async openMediaDevices(constraints: MediaStreamConstraints): Promise<MediaStream> {
    return await navigator.mediaDevices.getUserMedia(constraints);
  };

  public async aquireDevices(): Promise<void> {
    try {
      const stream = await this.openMediaDevices({ "video": { width: { ideal: 1280 }, height: { ideal: 1024 } }, "audio": { "echoCancellation": true } });
      console.log("Got MediaStream:", stream);

      stream.getTracks().forEach(track => this._peerConnection.addTrack(track, stream));

      this._deviceSettings = { ...this._deviceSettings, localStream: stream, hasCameraAccess: true, hasMicrophoneAccess: true };

      this.emit("onDeviceUpdated", this._deviceSettings);
    } catch (error) {
      console.error("Error accessing media devices", error);
    }
  };

  public async createOffer(): Promise<RTCSessionDescriptionInit> {
    const offer = await this._peerConnection.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
    await this._peerConnection.setLocalDescription(new RTCSessionDescription(offer));

    return offer;
  };

  public async receiveOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    this._peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this._peerConnection.createAnswer();
    await this._peerConnection.setLocalDescription(answer);

    return answer;
  };

  public async receiveAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    await this._peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  };
  
  public async receiveIceCandidate(idceCandidate: RTCIceCandidate): Promise<void> {
    await this._peerConnection.addIceCandidate(new RTCIceCandidate(idceCandidate));
  }

  public addRemoteMediaTrack(track: MediaStreamTrack): void {
    if (!this._deviceSettings.remoteStream) {
      const newStream = new MediaStream();
      newStream.addTrack(track);
      this._deviceSettings = { ...this._deviceSettings, remoteStream: newStream };
      this.onEmittingEvent("onDeviceUpdated");
      return;
    }

    this._deviceSettings.remoteStream.addTrack(track);
    this.onEmittingEvent("onDeviceUpdated");
  }

  public toggleCamera(): void {
    if (!this._deviceSettings.localStream) {
      this.aquireDevices();
      return;
    }

    this._deviceSettings.localStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
    const { hasCameraAccess } = this._deviceSettings;
    this._deviceSettings = { ...this._deviceSettings, hasCameraAccess: !hasCameraAccess };
    this.onEmittingEvent("onDeviceUpdated");
  }

  public toggleMicrophone(): void {
    if (!this._deviceSettings.localStream) {
      this.aquireDevices();
      return;
    }

    this._deviceSettings.localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
    const { hasMicrophoneAccess } = this._deviceSettings;
    this._deviceSettings = { ...this._deviceSettings, hasMicrophoneAccess: !hasMicrophoneAccess };
    this.onEmittingEvent("onDeviceUpdated");
  }

  private onEmittingEvent(event: EventsType): void {
    if (event === "onDeviceUpdated") {
      this.emit(event, this._deviceSettings);
    }
  }

  get peerConnection(): RTCPeerConnection {
    return this._peerConnection;
  }

  get deviceSettings(): IDeviceSettings {
    return this._deviceSettings;
  }
}

export default WebRTC;
