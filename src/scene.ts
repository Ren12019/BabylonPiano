import {
    ArcRotateCamera,
    Color3,
    Engine,
    HemisphericLight,
    Mesh,
    MeshBuilder,
    PointerEventTypes,
    PointerInfo,
    Scene,
    // SceneLoader,
    StandardMaterial,
    TransformNode,
    Vector3,
    WebXRFeatureName
} from 'babylonjs';
import Soundfont from 'soundfont-player';

export const buildKey = (scene: Scene, parent: TransformNode, props: any) => {
    if (props.type === "white") {
        /*
        Props for building a white key should contain:
        note, topWidth, bottomWidth, topPositionX, wholePositionX, register, referencePositionX

        As an example, the props for building the middle C white key would be
        {type: "white", note: "C", topWidth: 1.4, bottomWidth: 2.3, topPositionX: -0.45, wholePositionX: -14.4, register: 4, referencePositionX: 0}
        */

        // Create bottom part
        const bottom = MeshBuilder.CreateBox("whiteKeyBottom", {width: props.bottomWidth, height: 1.5, depth: 4.5}, scene);

        // Create top part
        const top = MeshBuilder.CreateBox("whiteKeyTop", {width: props.topWidth, height: 1.5, depth: 5}, scene);
        top.position.z =  4.75;
        top.position.x += props.topPositionX;

        // Merge bottom and top parts
        // Parameters of Mesh.MergeMeshes: (arrayOfMeshes, disposeSource, allow32BitsIndices, meshSubclass, subdivideWithSubMeshes, multiMultiMaterials)
        const key = Mesh.MergeMeshes([bottom, top], true, false, undefined, false, false);
        if(key) {
            key.position.x = props.referencePositionX + props.wholePositionX;
            key.name = props.note + props.register;
            key.parent = parent;
        }

        return key;
    }
    else if (props.type === "black") {
        /*
        Props for building a black key should contain:
        note, wholePositionX, register, referencePositionX

        As an example, the props for building the C#4 black key would be
        {type: "black", note: "C#", wholePositionX: -13.45, register: 4, referencePositionX: 0}
        */

        // Create black color material
        const blackMat = new StandardMaterial("black");
        blackMat.diffuseColor = new Color3(0, 0, 0);

        // Create black key
        const key = MeshBuilder.CreateBox(props.note + props.register, {width: 1.4, height: 2, depth: 5}, scene);
        key.position.z += 4.75;
        key.position.y += 0.25;
        key.position.x = props.referencePositionX + props.wholePositionX;
        key.material = blackMat;
        key.parent = parent;

        return key;
    }

    return null;
}

const scaleFromPivot = (transformNode: TransformNode, pivotPoint: Vector3, scale: number) => {
    const _sx = scale / transformNode.scaling.x;
    const _sy = scale / transformNode.scaling.y;
    const _sz = scale / transformNode.scaling.z;
    transformNode.scaling = new Vector3(_sx, _sy, _sz);
    transformNode.position = new Vector3(pivotPoint.x + _sx * (transformNode.position.x - pivotPoint.x), pivotPoint.y + _sy * (transformNode.position.y - pivotPoint.y), pivotPoint.z + _sz * (transformNode.position.z - pivotPoint.z));
}

export const createScene = async (engine: Engine) => {
    const scale = 0.015;
    const scene = new Scene(engine);

    const alpha =  3*Math.PI/2;
    const beta = Math.PI/50;
    const radius = 220*scale;
    const target = new Vector3(0, 0, 0);

    const canvas = document.getElementById("renderCanvas");
    const camera = new ArcRotateCamera("Camera", alpha, beta, radius, target, scene);
    camera.attachControl(canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.6;

    const keyParams = [
        {type: "white", note: "C", topWidth: 1.4, bottomWidth: 2.3, topPositionX: -0.45, wholePositionX: -14.4},
        {type: "black", note: "C#", wholePositionX: -13.45},
        {type: "white", note: "D", topWidth: 1.4, bottomWidth: 2.4, topPositionX: 0, wholePositionX: -12},
        {type: "black", note: "D#", wholePositionX: -10.6},
        {type: "white", note: "E", topWidth: 1.4, bottomWidth: 2.3, topPositionX: 0.45, wholePositionX: -9.6},
        {type: "white", note: "F", topWidth: 1.3, bottomWidth: 2.4, topPositionX: -0.55, wholePositionX: -7.2},
        {type: "black", note: "F#", wholePositionX: -6.35},
        {type: "white", note: "G", topWidth: 1.3, bottomWidth: 2.3, topPositionX: -0.2, wholePositionX: -4.8},
        {type: "black", note: "G#", wholePositionX: -3.6},
        {type: "white", note: "A", topWidth: 1.3, bottomWidth: 2.3, topPositionX: 0.2, wholePositionX: -2.4},
        {type: "black", note: "A#", wholePositionX: -0.85},
        {type: "white", note: "B", topWidth: 1.3, bottomWidth: 2.4, topPositionX: 0.55, wholePositionX: 0},
    ]

    // Transform Node that acts as the parent of all piano keys
    const keyboard = new TransformNode("keyboard");

    // Register 1 through 7
    var referencePositionX = -2.4*14;
    for (let register = 1; register <= 7; register++) {
        keyParams.forEach(key => {
            buildKey(scene, keyboard, Object.assign({register: register, referencePositionX: referencePositionX}, key));
        })
        referencePositionX += 2.4*7;
    }

    // Register 0
    buildKey(scene, keyboard, {type: "white", note: "A", topWidth: 1.9, bottomWidth: 2.3, topPositionX: -0.20, wholePositionX: -2.4, register: 0, referencePositionX: -2.4*21});
    keyParams.slice(10, 12).forEach(key => {
        buildKey(scene, keyboard, Object.assign({register: 0, referencePositionX: -2.4*21}, key));
    })

    // Register 8
    buildKey(scene, keyboard, {type: "white", note: "C", topWidth: 2.3, bottomWidth: 2.3, topPositionX: 0, wholePositionX: -2.4*6, register: 8, referencePositionX: 84});

    // Transform node that acts as the parent of all piano components
    const piano = new TransformNode("piano");
    keyboard.parent = piano;

    // Import and scale piano frame
    // おそらくフレームのモデルの提供が終了したため使用不可能
    // SceneLoader.ImportMesh("frame", "https://docs.microsoft.com/windows/mixed-reality/develop/javascript/tutorials/babylonjs-webxr-piano/files", "pianoFrame.babylon", scene, function(meshes) {
    //     const frame = meshes[0];
    //     frame.parent = piano;
    // });

    // Lift the piano keyboard
    keyboard.position.y += 80;

    // Scale the entire piano
    scaleFromPivot(piano, new Vector3(0, 0, 0), scale);

    const pointerToKey = new Map()
    const pianoSound = await Soundfont.instrument(new AudioContext(), 'acoustic_grand_piano');

    scene.onPointerObservable.add((pointerInfo: PointerInfo) => {
        switch (pointerInfo.type) {
            case PointerEventTypes.POINTERDOWN:
                // Only take action if the pointer is down on a mesh
                if(pointerInfo.pickInfo && pointerInfo.pickInfo.hit) {
                    let pickedMesh = pointerInfo.pickInfo.pickedMesh;
                    const pointerEvent = pointerInfo.event as PointerEvent;
                    let pointerId = pointerEvent.pointerId;
                    if (pickedMesh && pickedMesh.parent === keyboard) {
                        pickedMesh.position.y -= 0.5; // Move the key downward
                        if(pointerInfo.pickInfo.pickedMesh) {
                            pointerToKey.set(pointerId, {
                                mesh: pickedMesh,
                                note: pianoSound.play(pointerInfo.pickInfo.pickedMesh.name) // Play the sound of the note
                            });
                        }
                    }
                }
                break;
            case PointerEventTypes.POINTERUP:
                const pointerEvent = pointerInfo.event as PointerEvent;
                let pointerId = pointerEvent.pointerId;
                // Only take action if the released pointer was recorded in pointerToKey
                if (pointerToKey.has(pointerId)) {
                    pointerToKey.get(pointerId).mesh.position.y += 0.5; // Move the key upward
                    pointerToKey.get(pointerId).note.stop(); // Stop the sound of the note
                    pointerToKey.delete(pointerId);
                }
                break;
        }
    });

    const xrHelper = await scene.createDefaultXRExperienceAsync();

    const featuresManager = xrHelper.baseExperience.featuresManager;

    featuresManager.enableFeature(WebXRFeatureName.POINTER_SELECTION, "stable", {
        xrInput: xrHelper.input,
        enablePointerSelectionOnAllControllers: true
    });

    const ground = MeshBuilder.CreateGround("ground", {width: 400, height: 400});

    featuresManager.enableFeature(WebXRFeatureName.TELEPORTATION, "stable", {
        xrInput: xrHelper.input,
        floorMeshes: [ground],
        snapPositions: [new Vector3(2.4*3.5*scale, 0, -10*scale)],
    });

    return scene;
}