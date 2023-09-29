import {
    Camera,
    CannonJSPlugin,
    Color3,
    Color4,
    CubeTexture,
    DynamicTexture,
    Engine,
    FreeCamera,
    HemisphericLight,
    KeyboardEventTypes,
    Mesh,
    MeshBuilder,
    ParticleSystem,
    PBRMaterial,
    Scene,
    SceneLoader,
    StandardMaterial,
    Texture,
    Vector3
} from "@babylonjs/core";
import CANNON from "cannon";
import "@babylonjs/loaders";
import errorLoadingImage from '../../assets/errorLoading.png';

export const CreateMaterial = ({scene, diffMat, normalMat, armMat, uvScale, angle}: {
    scene: Scene, diffMat: string, normalMat: string, armMat: string, uvScale: number, angle: number
}) => {
    const pbr = new PBRMaterial("pbr", scene);
    pbr.albedoTexture = new Texture(diffMat, scene);
    pbr.bumpTexture = new Texture(normalMat, scene);
    pbr.metallicTexture = new Texture(armMat, scene);

    pbr.useAmbientOcclusionFromMetallicTextureRed = true;
    pbr.useRoughnessFromMetallicTextureGreen = true;
    pbr.useMetallnessFromMetallicTextureBlue = true;

    pbr.invertNormalMapX = true;
    pbr.invertNormalMapY = true;

    // @ts-ignore
    pbr.albedoTexture.uScale = uvScale
    // @ts-ignore
    pbr.albedoTexture.vScale = uvScale
    // @ts-ignore
    pbr.albedoTexture.wAng = angle;
    // @ts-ignore
    pbr.bumpTexture.uScale = uvScale
    // @ts-ignore
    pbr.bumpTexture.vScale = uvScale
    // @ts-ignore
    pbr.bumpTexture.wAng = angle;
    // @ts-ignore
    pbr.metallicTexture.uScale = uvScale
    // @ts-ignore
    pbr.metallicTexture.vScale = uvScale
    // @ts-ignore
    pbr.metallicTexture.wAng = angle;
    return pbr;
}

let setIsOpenNftModalAction: any = null
let setSelectedNftAction: any = null
let setIsIntersectedAction: any = null

let camera: any = null
let vv: any = null
let hinge: any = null
let fountainParticleSystem: any = null
let gutSightMat: any = null
let nftData: any = []

const CastRay = ({scene, camera}: { scene: any, camera: any }) => {
    const ray = camera.getForwardRay(200);
    const pickResult = scene.pickWithRay(ray);
    if (pickResult.hit == true) {
        if (pickResult.distance <= 10 && (pickResult.pickedMesh.id?.includes('switch') || pickResult.pickedMesh.id?.includes('plane1'))) {
            vv = pickResult.pickedMesh.id
            gutSightMat.alpha = 1;
            setIsIntersectedAction(true)
        } else {
            gutSightMat.alpha = 0.3;
            setIsIntersectedAction(false)
            vv = ''
        }
    } else {
        gutSightMat.alpha = 0.3;
        setIsIntersectedAction(false)
        vv = ''
    }
};


const CreateFountain = ({scene}: { scene: any }) => {
    const switcher = Mesh.CreateBox("switch", 0.5, scene);
    switcher.position.y = 2
    switcher.position.x = 3.5
    switcher.position.z = 5.2
    switcher.checkCollisions = true

    const fountainProfile = [
        new Vector3(1, 2, 0),
        new Vector3(1, 15, 0),
        new Vector3(3, 17, 0)
    ];

    const fountain = MeshBuilder.CreateLathe("fountain", {
        shape: fountainProfile,
        sideOrientation: Mesh.DOUBLESIDE
    }, scene);
    fountain.position.y = -7;

    fountainParticleSystem = new ParticleSystem("particles", 5000, scene);
    //Texture of each particle
    fountainParticleSystem.particleTexture = new Texture("./flare.png", scene);
    // Where the particles come from
    fountainParticleSystem.emitter = new Vector3(0, 8, 0);
    fountainParticleSystem.minEmitBox = new Vector3(-1, 0, 0);
    fountainParticleSystem.maxEmitBox = new Vector3(1, 0, 0);
    // Colors of all particles
    fountainParticleSystem.color1 = new Color4(0.7, 0.8, 1.0, 1.0);
    fountainParticleSystem.color2 = new Color4(0.2, 0.5, 1.0, 1.0);
    fountainParticleSystem.colorDead = new Color4(0, 0, 0, 0.0);
    // Size of each particle (random between...
    fountainParticleSystem.minSize = 0.1;
    fountainParticleSystem.maxSize = 0.5;
    // Life time of each particle (random between...
    fountainParticleSystem.minLifeTime = 3.5;
    fountainParticleSystem.maxLifeTime = 5.5;
    // Emission rate
    fountainParticleSystem.emitRate = 1500;
    // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
    fountainParticleSystem.blendMode = ParticleSystem.BLENDMODE_ONEONE;
    // Set the gravity of all particles
    fountainParticleSystem.gravity = new Vector3(0, -9.81, 0);
    // Direction of each particle after it has been emitted
    fountainParticleSystem.direction1 = new Vector3(-2, 8, 2);
    fountainParticleSystem.direction2 = new Vector3(2, 8, -2);
    // Angular speed, in radians
    fountainParticleSystem.minAngularSpeed = 0;
    fountainParticleSystem.maxAngularSpeed = Math.PI;
    // Speed
    fountainParticleSystem.minEmitPower = 1;
    fountainParticleSystem.maxEmitPower = 3;
    fountainParticleSystem.updateSpeed = 0.025;
    return [fountainParticleSystem]
}


let isStartFountain = false
const AddKeyboardController = ({scene, engine}: { scene: any, engine: any }) => {
    hinge = MeshBuilder.CreateBox("hinge", {}, scene)
    hinge.isVisible = false;
    hinge.position.y = 2;
    hinge.position.x = 10;
    hinge.checkCollisions = true
    scene.onKeyboardObservable.add((kbInfo: any) => {
        switch (kbInfo.type) {
            case KeyboardEventTypes.KEYDOWN: {
                if (kbInfo.event.key === 'e') {
                    if (vv.includes('plane1')) {
                        engine.exitPointerlock()
                        setIsOpenNftModalAction(true)
                        setSelectedNftAction(nftData?.find((item: any) => item?.id === vv.split('.')[1]))
                    }

                    if (vv.includes('switch')) {
                        if (!isStartFountain) {
                            isStartFountain = true
                            fountainParticleSystem.start();
                        } else {
                            isStartFountain = false
                            fountainParticleSystem.stop();
                        }
                    }
                }
                break;
            }
            case KeyboardEventTypes.KEYUP:
                break;
        }
    });
}


const addGunSight = ({scene}: { scene: any }) => {
    if (scene.activeCameras.length === 0) {
        scene.activeCameras.push(scene.activeCamera);
    }

    const secondCamera = new FreeCamera("GunSightCamera", new Vector3(0, 0, -50), scene);
    secondCamera.mode = Camera.ORTHOGRAPHIC_CAMERA;
    secondCamera.layerMask = 0x20000000;
    scene.activeCameras.push(secondCamera);

    const meshes = [];
    const h = 250;

    const y = Mesh.CreateBox("y", h * .2, scene);
    y.scaling = new Vector3(0.05, 0.5, 1);
    y.position = new Vector3(0, 0, 0);
    meshes.push(y);

    const x = Mesh.CreateBox("x", h * .2, scene);
    x.scaling = new Vector3(0.5, 0.05, 1);
    x.position = new Vector3(0, 0, 0);
    meshes.push(x);

    const gunSight = Mesh.MergeMeshes(meshes);
    gunSight!.name = "gunSight";
    gunSight!.layerMask = 0x20000000;
    gunSight!.freezeWorldMatrix();

    gutSightMat = new StandardMaterial("emissive mat", scene);
    gutSightMat.checkReadyOnlyOnce = true;
    gutSightMat.emissiveColor = new Color3(0, 0, 0);
    gutSightMat.alpha = 0.3;

    gunSight!.material = gutSightMat;
};

export const CreateEnvironment = async ({scene}: { scene: Scene, }): Promise<void> => {
    const {meshes} = await SceneLoader.ImportMeshAsync(
        "",
        "./",
        "pol.glb",
        scene,
    );

    meshes.map((mesh, index) => {
        mesh.checkCollisions = true
        if (index == 3)
            mesh.material = CreateMaterial({
                scene,
                diffMat: "./cube/red_bricks_04_diff_1k.jpg",
                normalMat: "./cube/red_bricks_04_nor_gl_1k.jpg",
                armMat: "./cube/red_bricks_04_arm_1k.jpg",
                uvScale: 4,
                angle: Math.PI / 2
            })
        if (index == 2)
            mesh.material = CreateMaterial({
                scene,
                diffMat: "./wall/brick_wall_001_diffuse_1k.jpg",
                normalMat: "./wall/brick_wall_001_nor_gl_1k.jpg",
                armMat: "./wall/brick_wall_001_arm_1k.jpg",
                uvScale: 12,
                angle: Math.PI
            })
        if (index == 1) {
            mesh.material = CreateMaterial({
                scene,
                diffMat: "./floor/wood_planks_grey_diff_1k.jpg",
                normalMat: "./floor/wood_planks_grey_nor_gl_1k.jpg",
                armMat: "./floor/wood_planks_grey_arm_1k.jpg",
                uvScale: 16,
                angle: Math.PI / 2
            })
        }
    });

    const envTex = CubeTexture.CreateFromPrefilteredData("./environment/env.env", scene);
    envTex.gammaSpace = false;
    envTex.rotationY = Math.PI;
    scene.environmentTexture = envTex;
    scene.createDefaultSkybox(envTex, true, 500, 0.20);
}

export const CreateController = ({scene}: any): any => {
    const camera = new FreeCamera("camera", new Vector3(6, 5, 7), scene);
    camera.attachControl();
    camera.applyGravity = true;
    camera.checkCollisions = true;
    camera.ellipsoid = new Vector3(1, 1, 1);
    camera.minZ = 0.45;
    camera.speed = 0.75;
    camera.angularSensibility = 4000;


    camera.keysUp.push(87);
    camera.keysLeft.push(65);
    camera.keysDown.push(83);
    camera.keysRight.push(68);
    document.onkeydown = (e) => {
        if (e.code === "Space")
            if (camera.position._y <= 3)
                camera.cameraDirection.y += 1;
    };
    return camera
}

export const CreateScene = ({engine}: { engine: Engine }): Scene => {
    const scene = new Scene(engine);
    new HemisphericLight("hemiLight", new Vector3(-1, 1, 0), scene);
    new HemisphericLight("hemiLight", new Vector3(1, 1, 0), scene);

    scene.onPointerDown = (evt) => {
        if (evt.button === 0) engine.enterPointerlock();
        if (evt.button === 1) engine.exitPointerlock();
    };

    const framesPerSecond = 60;
    const gravity = -9.81;
    scene.gravity = new Vector3(0, gravity / framesPerSecond, 0);
    scene.collisionsEnabled = true;

    scene.enablePhysics(
        new Vector3(0, -9.81, 0),
        new CannonJSPlugin(true, 10, CANNON)
    );

    return scene;
}


export const coordinates: Array<{
    xp: number, yp: number, zp: number, xr: number, yr: number, zr: number
}> = [
    {xp: -37.7, yp: 3.5, zp: 0, xr: 0, yr: -Math.PI / 2, zr: 0,},
    {xp: -37.6, yp: 3.5, zp: 8, xr: 0, yr: -Math.PI / 2, zr: 0,},
    {xp: -37.6, yp: 3.5, zp: 16, xr: 0, yr: -Math.PI / 2, zr: 0,},
    {xp: -37.6, yp: 3.5, zp: 24, xr: 0, yr: -Math.PI / 2, zr: 0,},
    {xp: -37.7, yp: 3.5, zp: 32, xr: 0, yr: -Math.PI / 2, zr: 0,},

    {xp: -37.6, yp: 3.5, zp: -8, xr: 0, yr: -Math.PI / 2, zr: 0,},
    {xp: -37.6, yp: 3.5, zp: -16, xr: 0, yr: -Math.PI / 2, zr: 0,},
    {xp: -37.6, yp: 3.5, zp: -24, xr: 0, yr: -Math.PI / 2, zr: 0,},
    {xp: -37.7, yp: 3.5, zp: -32, xr: 0, yr: -Math.PI / 2, zr: 0,},


    {xp: 0, yp: 3.5, zp: 38, xr: 0, yr: -Math.PI * 2, zr: 0,},
    {xp: 8, yp: 3.5, zp: 37.9, xr: 0, yr: -Math.PI * 2, zr: 0,},
    {xp: 16, yp: 3.5, zp: 37.9, xr: 0, yr: -Math.PI * 2, zr: 0,},
    {xp: 24, yp: 3.5, zp: 37.9, xr: 0, yr: -Math.PI * 2, zr: 0,},
    {xp: 32, yp: 3.5, zp: 38, xr: 0, yr: -Math.PI * 2, zr: 0,},

    {xp: -8, yp: 3.5, zp: 37.9, xr: 0, yr: -Math.PI * 2, zr: 0,},
    {xp: -16, yp: 3.5, zp: 37.9, xr: 0, yr: -Math.PI * 2, zr: 0,},
    {xp: -24, yp: 3.5, zp: 37.9, xr: 0, yr: -Math.PI * 2, zr: 0,},
    {xp: -32, yp: 3.5, zp: 38, xr: 0, yr: -Math.PI * 2, zr: 0,},


    {xp: 38.2, yp: 3.5, zp: 0, xr: 0, yr: Math.PI / 2, zr: 0,},
    {xp: 38.1, yp: 3.5, zp: 8, xr: 0, yr: Math.PI / 2, zr: 0,},
    {xp: 38.1, yp: 3.5, zp: 16, xr: 0, yr: Math.PI / 2, zr: 0,},
    {xp: 38.1, yp: 3.5, zp: 24, xr: 0, yr: Math.PI / 2, zr: 0,},
    {xp: 38.2, yp: 3.5, zp: 32, xr: 0, yr: Math.PI / 2, zr: 0,},

    {xp: 38.1, yp: 3.5, zp: -8, xr: 0, yr: Math.PI / 2, zr: 0,},
    {xp: 38.1, yp: 3.5, zp: -16, xr: 0, yr: Math.PI / 2, zr: 0,},
    {xp: 38.1, yp: 3.5, zp: -24, xr: 0, yr: Math.PI / 2, zr: 0,},
    {xp: 38.2, yp: 3.5, zp: -32, xr: 0, yr: Math.PI / 2, zr: 0,},


    {xp: 0, yp: 3.5, zp: -38, xr: 0, yr: Math.PI, zr: 0,},
    {xp: 8, yp: 3.5, zp: -37.9, xr: 0, yr: Math.PI, zr: 0,},
    {xp: 16, yp: 3.5, zp: -37.9, xr: 0, yr: Math.PI, zr: 0,},
    {xp: 24, yp: 3.5, zp: -37.9, xr: 0, yr: Math.PI, zr: 0,},
    {xp: 32, yp: 3.5, zp: -38, xr: 0, yr: Math.PI, zr: 0,},

    {xp: -8, yp: 3.5, zp: -37.9, xr: 0, yr: Math.PI, zr: 0,},
    {xp: -16, yp: 3.5, zp: -37.9, xr: 0, yr: Math.PI, zr: 0,},
    {xp: -24, yp: 3.5, zp: -37.9, xr: 0, yr: Math.PI, zr: 0,},
    {xp: -32, yp: 3.5, zp: -38, xr: 0, yr: Math.PI, zr: 0,},


    {xp: 4.5, yp: 3.5, zp: 0, xr: 0, yr: -Math.PI / 2, zr: 0,},
    {xp: 0, yp: 3.5, zp: 5.5, xr: 0, yr: -Math.PI, zr: 0,},
    {xp: 0, yp: 3.5, zp: -5.8, xr: 0, yr: -Math.PI * 2, zr: 0,},
    {xp: -5, yp: 3.5, zp: 0, xr: 0, yr: Math.PI / 2, zr: 0,},
]

export const setWallNft = (imageOrdinals: any[], handlerFetch: any) => {
    nftData = imageOrdinals
    imageOrdinals?.map((item: any, index: number) => {
            if (index < 40)
                handlerFetch({
                    xp: coordinates[index].xp,
                    yp: coordinates[index].yp,
                    zp: coordinates[index].zp,
                    xr: coordinates[index].xr,
                    yr: coordinates[index].yr,
                    zr: coordinates[index].zr,
                    image: item.image,
                    id: item.id,
                })
        }
    )
}

export const createImagePlane = ({xp, yp, zp, xr, yr, zr, image, scene, id}: {
    xp: number, yp: number, zp: number, xr: number, yr: number, zr: number, image: string, scene: Scene, id: any
}) => {
    try {
        let img = new Image();
        let imageUrl = image
        img.src = imageUrl;
        img.onload = function () {
            let height = img.height;
            let width = img.width;
            let plane = MeshBuilder.CreatePlane("plane1." + id, {height: 5, width: 5 * width / height}, scene);
            let mat = new StandardMaterial("plane2", scene);
            mat.diffuseTexture = new Texture(imageUrl, scene);
            plane.material = mat;
            plane.rotation = new Vector3(xr, yr, zr);
            plane.position.x = xp
            plane.position.y = yp
            plane.position.z = zp
        }

        img.onerror = function () {
            img = new Image();
            imageUrl = errorLoadingImage
            img.src = imageUrl
            img.onload = function () {
                let height = img.height;
                let width = img.width;
                let plane = MeshBuilder.CreatePlane("plane1." + id, {
                    height: 5,
                    width: 5 * width / height
                }, scene);
                let mat = new StandardMaterial("plane2", scene);
                mat.diffuseTexture = new Texture(imageUrl, scene);
                plane.material = mat;
                plane.rotation = new Vector3(xr, yr, zr);
                plane.position.x = xp
                plane.position.y = yp
                plane.position.z = zp
            }
        }
    } catch (err) {
        console.log("Error createImagePlane !")
    }
}

export const showNftDescriptionOrLoading = (scene: Scene, txt: string, position: any, rotation: any, loading?: any) => {
    if (txt) {
        let font_type = "Arial";
        let planeWidth = loading ? 2 : 6;
        let planeHeight = loading ? 2 : 0.7;
        let plane = MeshBuilder.CreatePlane("plane", {width: planeWidth, height: planeHeight}, scene);
        let DTWidth = planeWidth * 60;
        let DTHeight = planeHeight * 60;
        plane.position = position
        plane.rotation.x = rotation.xr
        plane.rotation.y = rotation.yr
        plane.rotation.z = rotation.zr
        var text = loading ? 'Loading...' : txt;
        // @ts-ignore
        let dynamicTexture = new DynamicTexture("DynamicTexture", {width: DTWidth, height: DTHeight}, scene);
        let ctx = dynamicTexture.getContext();
        let size = 20;
        ctx.font = size + "px " + font_type;
        let textWidth = ctx.measureText(text.length <= 28 ? `${' '.repeat((28 - text.length) / 2)}${text}${' '.repeat((28 - text.length) / 2)}` : text).width;
        let ratio = textWidth / size;
        let font_size = Math.floor(DTWidth / (ratio * 1));
        let font = font_size + "px " + font_type;
        dynamicTexture.drawText(text, null, null, font, "#000000", "#ffffff", true);
        let mat = new StandardMaterial("mat", scene);
        mat.diffuseTexture = dynamicTexture;
        plane.material = mat;
    }
}

export const showNft = (scene: Scene, imageOrdinals: any) => {
    setWallNft(imageOrdinals, createImagePlane)
    if (imageOrdinals?.length != 0) {
        imageOrdinals?.map((_: any, index: any) => {
                if (index < 36) {
                    showNftDescriptionOrLoading(scene, imageOrdinals[index]?.name,
                        new Vector3(
                            coordinates[index].xp > 0 ? coordinates[index].xp + 0.1 : coordinates[index].xp - 0.1,
                            coordinates[index].yp,
                            coordinates[index].zp > 0 ? coordinates[index].zp + 0.1 : coordinates[index].zp - 0.1
                        ),
                        {
                            xr: coordinates[index].xr,
                            yr: coordinates[index].yr,
                            zr: coordinates[index].zr
                        },
                        true
                    )
                }
                showNftDescriptionOrLoading(scene, imageOrdinals[index]?.name,
                    new Vector3(
                        coordinates[index].xp > 0 ? coordinates[index].xp + 0.001 : coordinates[index].xp - 0.001,
                        coordinates[index].yp - 3,
                        coordinates[index].zp > 0 ? coordinates[index].zp + 0.001 : coordinates[index].zp - 0.001
                    ),
                    {
                        xr: coordinates[index].xr,
                        yr: coordinates[index].yr,
                        zr: coordinates[index].zr
                    }
                )

            }
        )
    }
}

export const initCanvasScene = (
    engine: Engine, scene: Scene, canvasRef: any, setGameActive: any,
    setIsOpenNftModal: any, setSelectedNft: any, setIsIntersected: any
) => {
    engine = new Engine(canvasRef.current, true);
    scene = CreateScene({engine});
    CreateEnvironment({scene});
    camera = CreateController({scene, engine});

    setIsOpenNftModalAction = setIsOpenNftModal
    setSelectedNftAction = setSelectedNft
    setIsIntersectedAction = setIsIntersected

    CreateFountain({scene})
    AddKeyboardController({scene, engine})
    addGunSight({scene})

    scene.registerBeforeRender(() => CastRay({scene, camera}));

    engine.runRenderLoop(function () {
        window.addEventListener("resize", () => {
            engine.resize();
        });
        scene.render();
    });

    const canvas: any = document.querySelector("canvas");
    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resize()
    window.addEventListener('resize', resize)

    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") setGameActive(false)
    }, false);

    window.addEventListener("resize", () => {
        engine.resize();
    });

}

