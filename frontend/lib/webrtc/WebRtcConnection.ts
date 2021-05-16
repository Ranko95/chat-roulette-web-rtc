import { CONNECTION_TYPE } from "../../consts/webrtc/CONNECTION_TYPE";
import { SDP, sdpType } from "../../context/roulette";

export type connectionType = `${CONNECTION_TYPE}`;

export interface IWebRtcConnectionConstructorData {
  iceServers: any;
  type: connectionType;
  stream: MediaStream | null;

  onGotOffer(data: { sdp?: string, type: sdpType }): void;
  onGotStream({ stream }: { stream: MediaStream }): void;
  onGotCandidate({ candidate } : { candidate: RTCIceCandidate }): void;
  onIceConnectionStateDisconnected(): void;
  onIceConnectionStateFailed(): void;
}

export class WebRtcConnection {
  peerConnection: RTCPeerConnection | null;

  iceServers: any;
  sdpAnswerSet: boolean;
  type: connectionType;
  candidateQueue: RTCIceCandidate[];
  stream: MediaStream | null;
  remoteStream: MediaStream | null;

  onGotStream;
  onGotOffer;
  onGotCandidate;
  onIceConnectionStateDisconnected;
  onIceConnectionStateFailed;

  constructor(data: IWebRtcConnectionConstructorData) {
    this.peerConnection = null;

    this.iceServers = data.iceServers;
    this.stream = data.stream;
    this.remoteStream = null;
    this.type = data.type;

    this.onGotStream = data.onGotStream;
    this.onGotOffer = data.onGotOffer;
    this.onGotCandidate = data.onGotCandidate;
    this.onIceConnectionStateDisconnected = data.onIceConnectionStateDisconnected;
    this.onIceConnectionStateFailed = data.onIceConnectionStateFailed;

    this.candidateQueue = [];
    this.sdpAnswerSet = false;
  }

  public async createPeerConnection(): Promise<void> {
    this.peerConnection = new RTCPeerConnection({ iceServers: this.iceServers });

    this.peerConnection.oniceconnectionstatechange = () => {
      const iceConnectionState = this.peerConnection?.iceConnectionState;
      console.log("onIceConnectionStateChange", iceConnectionState);

      if (iceConnectionState === "disconnected") {
        this.onIceConnectionStateDisconnected();
      }
      if (iceConnectionState === "failed") {
        this.onIceConnectionStateFailed();
      }
    }

    this.peerConnection.onicecandidate = (e) => {
      console.log("onIceCandidate", e);
      if (!e.candidate) {
        return;
      }
      this.onGotCandidate({ candidate: e.candidate });
    }

    this.peerConnection.ontrack = (e) => {
      console.log("onTrack", e);
      this.remoteStream = this.remoteStream || new MediaStream();
      this.remoteStream.addTrack(e.track);
      this.onGotStream({ stream: this.remoteStream });
    }
  }

  public async createOffer(): Promise<void> {
    console.log("create offer; stream", this.stream);
    if(!this.peerConnection) {
      return;
    }

    if (this.stream) {
      this.stream.getTracks().map((track) => {
        console.log("add track", track);
        this.peerConnection?.addTrack(track);
      });
    }

    const offer = await this.peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });
    await this.peerConnection.setLocalDescription(offer);
    console.log("create offer", offer);
    this.onGotOffer({ sdp: offer.sdp, type: SDP.OFFER });
  }

  public async processOffer(sdp: string): Promise<void> {
    if (!this.peerConnection) {
      return;
    }

    console.log("process offer", sdp);

    if (this.stream) {
      this.stream.getTracks().map((track) => {
        console.log("add track", track);
        this.peerConnection?.addTrack(track);
      });
    }
    
    const offer = new RTCSessionDescription({ type: "offer", sdp });
    await this.peerConnection.setRemoteDescription(offer);
    this.sdpAnswerSet = true;

    await Promise.all(this.candidateQueue.map((candidate) => {
      this.addIceCandidate(candidate);
    }));
    this.candidateQueue = [];

    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    this.onGotOffer({ sdp: answer.sdp, type: SDP.ANSWER });
  }

  public async addAnswer(sdp: string): Promise<void> {
    if (!this.peerConnection) {
      return;
    }

    console.log("addAnswer", sdp);
    const answer = new RTCSessionDescription({ type: "answer", sdp });
    await this.peerConnection.setRemoteDescription(answer);
    this.sdpAnswerSet = true;

    await Promise.all(this.candidateQueue.map((candidate) => {
      this.addIceCandidate(candidate);
    }));
    this.candidateQueue = [];
  }

  public async addIceCandidate(candidate: RTCIceCandidate): Promise<void> {
    if (!this.peerConnection) {
      return;
    }
    
    console.log("addIceCandidate", this.sdpAnswerSet, candidate);
    if (this.sdpAnswerSet) {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } else {
      this.candidateQueue.push(candidate);
    }
  }

  public changeStream(stream: MediaStream): void {
    console.log("changeStream");
  }

  public release(): void {
    console.log("release");
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }

  public isCaller(): boolean {
    return this.type === CONNECTION_TYPE.CALLER;
  }

  public isCallee(): boolean {
    return this.type === CONNECTION_TYPE.CALLEE;
  }
}
