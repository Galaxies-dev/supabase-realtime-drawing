import { Canvas, Path, SkPath, Skia, TouchInfo, useTouchHandler } from '@shopify/react-native-skia';
import React, { Fragment, forwardRef, useCallback, useImperativeHandle, useState } from 'react';

type DrawingBoardProps = {
  onStart: (x: number, y: number) => void;
  onActive: (x1: number, y1: number, x2: number, y2: number) => void;
};

export type DrawingBoardRef = {
  receivedStart: (x: number, y: number, user: string, color: string) => void;
  receivedActive: (x1: number, y1: number, x2: number, y2: number, user: string) => void;
};

const DrawingBoard = forwardRef<DrawingBoardRef, DrawingBoardProps>(
  ({ onStart, onActive }: DrawingBoardProps, ref) => {
    const [paths, setPaths] = useState<SkPath[]>([]);
    const [otherPaths, setOtherPaths] = useState<
      { paths: SkPath[]; user: string; color: string }[]
    >([]);

    useImperativeHandle(ref, () => ({
      receivedStart: onOtherDrawingStart,
      receivedActive: onOtherDrawingActive,
    }));

    const onOtherDrawingStart = (x: number, y: number, user: string, color: string) => {
      setOtherPaths((old) => {
        const userPaths = old.find((path) => path.user === user);
        if (userPaths) {
          const newPath = Skia.Path.Make();
          newPath.moveTo(x, y);

          const arr = [...userPaths.paths, newPath];

          return [...old.filter((path) => path.user !== user), { paths: arr, user, color }];
        } else {
          const newPath = Skia.Path.Make();
          newPath.moveTo(x, y);
          return [...old, { paths: [newPath], user, color }];
        }
      });
    };

    const onOtherDrawingActive = (x1: number, y1: number, x2: number, y2: number, user: string) => {
      setOtherPaths((currentPaths) => {
        const userPaths = currentPaths.find((path) => path.user === user);

        if (userPaths) {
          const currentPath = userPaths.paths[userPaths.paths.length - 1];
          currentPath.quadTo(x1, y1, x2, y2);
          return [
            ...currentPaths.filter((path) => path.user !== user),
            {
              user,
              color: userPaths.color,
              paths: [...userPaths.paths.slice(0, userPaths.paths.length - 1), currentPath],
            },
          ];
        } else {
          return currentPaths;
        }
      });
    };

    // EXISTING CODE
    // Kudos to https://spin.atomicobject.com/react-native-skia/
    const onDrawingStart = useCallback((touchInfo: TouchInfo) => {
      setPaths((old) => {
        const { x, y } = touchInfo;
        onStart(x, y);
        const newPath = Skia.Path.Make();
        newPath.moveTo(x, y);
        return [...old, newPath];
      });
    }, []);

    const onDrawingActive = useCallback((touchInfo: TouchInfo) => {
      setPaths((currentPaths) => {
        const { x, y } = touchInfo;
        const currentPath = currentPaths[currentPaths.length - 1];
        const lastPoint = currentPath.getLastPt();
        const xMid = (lastPoint.x + x) / 2;
        const yMid = (lastPoint.y + y) / 2;

        onActive(lastPoint.x, lastPoint.y, xMid, yMid);

        currentPath.quadTo(lastPoint.x, lastPoint.y, xMid, yMid);
        return [...currentPaths.slice(0, currentPaths.length - 1), currentPath];
      });
    }, []);

    const touchHandler = useTouchHandler(
      {
        onActive: onDrawingActive,
        onStart: onDrawingStart,
      },
      [onDrawingActive, onDrawingStart]
    );

    return (
      <Canvas style={{ flex: 1 }} onTouch={touchHandler}>
        {paths.map((path, index) => (
          <Path key={index} path={path} color={'black'} style={'stroke'} strokeWidth={2} />
        ))}
        {otherPaths.map((info, index) => (
          <Fragment key={`${info.user}-${index}`}>
            {info.paths.map((path, i2) => (
              <Path key={i2} path={path} color={info.color} style={'stroke'} strokeWidth={2} />
            ))}
          </Fragment>
        ))}
      </Canvas>
    );
  }
);

export default DrawingBoard;
