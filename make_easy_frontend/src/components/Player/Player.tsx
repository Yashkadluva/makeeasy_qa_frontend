import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import "./Player.scss";
import ReactPlayer from "react-player";

export interface PropData {
  url: any;
}

const getCircleCenterCoords = ({ x, y, width }: any) => {
  const radius = width / 2;
  return { x: x + radius, y: y + radius };
};

const getRotationForPoint = (vertex: any, point: any) => {
  const adjacent = vertex.y - point.y;
  const opposite = point.x - vertex.x;
  const centralAngle = Math.atan(opposite / adjacent);
  const mod = point.y > vertex.y ? Math.PI : 2 * Math.PI;
  const rotation =
    centralAngle + mod > 2 * Math.PI ? centralAngle : centralAngle + mod;
  return rotation / (2 * Math.PI);
};

const getDefaultLabels = (playing: boolean) => ({
  PLAY_BUTTON: playing ? "Pause" : "Play",
});

const PlayIcon = ({ playing }: any) => (
  <span className={`rpcc-play-icon${playing ? " pause" : ""}`} />
);

const ReactPlayerCircleControls = (props: PropData) => {
  const player = useRef<any>(null);
  const playerRef = useRef<any>(null);
  const buttonRef = useRef<any>(null);
  const [playing, setPlaying] = useState(false);
  const labels = getDefaultLabels(playing);
  const [playerState, setPlayerState] = useState({
    played: 0,
    loaded: 0,
  });

  const onSeek = (amount: number) => {
    if (player.current) {
      player.current.seekTo(amount, "fraction");
    }
  };

  const vars = {
    "--rpcc-progress-loaded": playerState.loaded,
    "--rpcc-progress-played": playerState.played,
    "--rpcc-progress-size": `6px`,
    "--rpcc-size": `50px`,
  } as React.CSSProperties;

  const onSeekClick = (e: any) => {
    if (buttonRef.current && buttonRef.current.contains(e.target)) {
      return;
    }

    const point = { x: e.clientX, y: e.clientY };
    const vertex = getCircleCenterCoords(
      playerRef.current.getBoundingClientRect()
    );
    onSeek(getRotationForPoint(vertex, point));
  };

  return (
    props.url ?
    <>
      <ReactPlayer
        ref={player}
        url={props.url}
        playing={playing}
        height="0"
        width="0"
        onProgress={setPlayerState}
        onEnded={() => setPlaying(false)}
      />
      <div className="rpcc-player" style={vars} onClick={onSeekClick}>
        <div ref={playerRef} className="rpcc-player-inner">
          <svg className="rpcc-ring-container">
            <circle
              shapeRendering="geometricPrecision"
              className="rpcc-ring rpcc-ring__duration"
            />
            <circle
              shapeRendering="geometricPrecision"
              className="rpcc-ring rpcc-ring__loaded"
            />
            <circle
              shapeRendering="geometricPrecision"
              className="rpcc-ring rpcc-ring__played"
            />
          </svg>
          <button
            ref={buttonRef}
            type="button"
            className="rpcc-play-button"
            aria-label={labels.PLAY_BUTTON}
            onClick={() => setPlaying(!playing)}
          >
            {<PlayIcon playing={playing} />}
          </button>
        </div>
      </div>
    </> : <></>
  );
};


export default ReactPlayerCircleControls;
