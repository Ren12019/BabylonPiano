import { Engine } from 'babylonjs';
import { createScene } from './scene';

const canvas = document.getElementById("renderCanvas"); // �L�����o�X�v�f���擾
const engine = new Engine(canvas as HTMLCanvasElement, true); // BABYLON 3D �G���W���𐶐�

// �����_�����O���[�v��o�^���āA�V�[�����J��Ԃ������_�����O
createScene(engine).then(sceneToRender => {
    engine.runRenderLoop(() => sceneToRender.render());
});

// �u���E�U�ƃL�����o�X�̃��T�C�Y�C�x���g���Ď�
window.addEventListener("resize", function () {
        engine.resize();
});
