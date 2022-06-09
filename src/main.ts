import { Engine } from 'babylonjs';
import { createScene } from './scene';

const canvas = document.getElementById("renderCanvas"); // キャンバス要素を取得
const engine = new Engine(canvas as HTMLCanvasElement, true); // BABYLON 3D エンジンを生成

// レンダリングループを登録して、シーンを繰り返しレンダリング
createScene(engine).then(sceneToRender => {
    engine.runRenderLoop(() => sceneToRender.render());
});

// ブラウザとキャンバスのリサイズイベントを監視
window.addEventListener("resize", function () {
        engine.resize();
});
