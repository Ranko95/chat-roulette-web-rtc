interface IArguments {
  enabled: boolean,
  tracks: MediaStreamTrack[],
}

export const changeTracksState = ({ enabled, tracks }: IArguments) => {
  tracks.map((track) => {
    track.enabled = enabled;
  });
}
