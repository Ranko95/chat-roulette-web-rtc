import { EventEmitter } from "events";
import { IWebRtcConnectionConstructorData, WebRtcConnection } from "./WebRtcConnection";

export interface IDeviceSettings {
  hasCameraAccess: boolean;
  hasMicrophoneAccess: boolean;
}

export enum Events {
  DEVICE_UPDATED = "onDeviceUpdated",
  LOCAL_STREAM_UPDATED = "onLocalStreamUpdated",
  REMOTE_STREAM_UPDATED = "onRemoteStreamUpdated",
}

type EventsType = `${Events}`;

export class WebRtcController extends EventEmitter {
  public localStream: MediaStream | null;
  public remoteStream: MediaStream | null;
  public deviceSettings: IDeviceSettings;

  private connection: WebRtcConnection | null;

  constructor() {
    super();
    this.localStream = null;
    this.remoteStream = null;
    this.deviceSettings = {
      hasCameraAccess: false,
      hasMicrophoneAccess: false,
    }

    this.connection = null;
  }

  public async openMediaDevices(constraints: MediaStreamConstraints): Promise<MediaStream> {
    return await navigator.mediaDevices.getUserMedia(constraints);
  }

  public async aquireDevices(): Promise<void> {
    try {
      const stream = await this.openMediaDevices({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: { echoCancellation: true },
      });
      console.log("Got MediaStream:", stream);

      this.localStream = stream;

      this.deviceSettings = {
        ...this.deviceSettings,
        hasCameraAccess: true,
        hasMicrophoneAccess: true,
      };

      this.onEmittingEvent(Events.DEVICE_UPDATED);
      this.onEmittingEvent(Events.LOCAL_STREAM_UPDATED);
    } catch (error) {
      console.error("Error accessing media devices", error);
    }
  }

  public toggleCamera(): void {
    if (!this.localStream) {
      this.aquireDevices();
      return;
    }

    this.localStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
    const { hasCameraAccess } = this.deviceSettings;
    this.deviceSettings = { ...this.deviceSettings, hasCameraAccess: !hasCameraAccess };
    this.onEmittingEvent(Events.DEVICE_UPDATED);
  }

  public toggleMicrophone(): void {
    if (!this.localStream) {
      this.aquireDevices();
      return;
    }

    this.localStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
    const { hasMicrophoneAccess } = this.deviceSettings;
    this.deviceSettings = { ...this.deviceSettings, hasMicrophoneAccess: !hasMicrophoneAccess };
    this.onEmittingEvent(Events.DEVICE_UPDATED);
  }

  public async createConnection(data: IWebRtcConnectionConstructorData): Promise<WebRtcConnection> {
    const connection = new WebRtcConnection(data);
    this.connection = connection;

    try {
      await this.connection.createPeerConnection();
      if (connection.isCaller()) {
        await connection.createOffer();
      }

      return connection;
    } catch (e) {
      this.stopConnection();
      throw e;
    }
  }

  public async addIceCandidate({ candidate }: { candidate: RTCIceCandidate }): Promise<void> {
    if (!this.connection) {
      return;
    }

    await this.connection.addIceCandidate(candidate);
  }

  public async processOffer({ offerSdp }: { offerSdp: string }): Promise<void> {
    if (!this.connection) {
      return;
    }

    await this.connection.processOffer(offerSdp);
  }

  public async addAnswer({ answerSdp }: { answerSdp: string }): Promise<void> {
    if (!this.connection) {
      return;
    }

    await this.connection.addAnswer(answerSdp);
  }

  public stopConnection(): boolean {
    if (!this.connection) {
      return false;
    }

    this.clearConnection(this.connection);
    return true;
  }

  private clearConnection(connection: WebRtcConnection): void {
    connection.release();
    this.connection = null;
  }

  private onEmittingEvent(event: EventsType): void {
    if (event === Events.DEVICE_UPDATED) {
      this.emit(event, this.deviceSettings);
      return;
    }
    if (event === Events.LOCAL_STREAM_UPDATED) {
      this.emit(event, this.localStream);
      return;
    }
    if (event === Events.REMOTE_STREAM_UPDATED) {
      this.emit(event, this.remoteStream);
      return;
    }
  }
}
