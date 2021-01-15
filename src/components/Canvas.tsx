import { FC, ReactElement, useEffect, useRef } from "react";
import { View, PanResponder } from "react-native";
import Svg, { G } from "react-native-svg";
import { useAtom } from "jotai";

import { dimensionAtom, offsetAtom, zoomAtom } from "../atoms/canvas";
import { dragAtom } from "../atoms/drag";
import Shapes from "./Shapes";
import Dots from "./Dots";
import Toolbar from "./Toolbar";
import { hackTouchableNodeAll } from "../utils/touchHandlerHack";

type Props = {
  width: number;
  height: number;
  ShapesElement?: ReactElement;
  DotsElement?: ReactElement;
  ToolbarElement?: ReactElement;
};

export const Canvas: FC<Props> = ({
  width,
  height,
  ShapesElement = <Shapes />,
  DotsElement = <Dots />,
  ToolbarElement = <Toolbar />,
}) => {
  const [, setDimension] = useAtom(dimensionAtom);
  useEffect(() => {
    setDimension({ width, height });
  }, [setDimension, width, height]);

  const [offset] = useAtom(offsetAtom);
  const [zoom] = useAtom(zoomAtom);
  const [, drag] = useAtom(dragAtom);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (_evt, _gestureState) => true,
      onStartShouldSetPanResponderCapture: (_evt, _gestureState) => true,
      onMoveShouldSetPanResponder: (_evt, _gestureState) => true,
      onMoveShouldSetPanResponderCapture: (_evt, _gestureState) => true,
      onPanResponderTerminationRequest: (_evt, _gestureState) => true,
      onPanResponderGrant: (_evt, gestureState) => {
        drag([gestureState.x0, gestureState.y0]);
      },
      onPanResponderMove: (_evt, gestureState) => {
        drag([gestureState.moveX, gestureState.moveY]);
      },
      onPanResponderRelease: (_evt, _gestureState) => {
        drag("end");
      },
      onPanResponderTerminate: (_evt, _gestureState) => {
        drag("end");
      },
    })
  ).current;

  return (
    <View {...panResponder.panHandlers}>
      <Svg viewBox={`${offset.x} ${offset.y} ${width / zoom} ${height / zoom}`}>
        {ShapesElement}
        {DotsElement}
        <G
          id="toolbar"
          transform={`translate(${offset.x + 10 / zoom} ${
            offset.y + 10 / zoom
          }) scale(${1 / zoom})`}
          onPressIn={(e) => {
            // doesn't seem to work?
            e.preventDefault();
            e.stopPropagation();
          }}
          ref={hackTouchableNodeAll((e: any) => {
            e.preventDefault();
            e.stopPropagation();
          })}
        >
          {ToolbarElement}
        </G>
      </Svg>
    </View>
  );
};

export default Canvas;
