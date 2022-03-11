import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { MeshLine, MeshLineMaterial } from 'three.meshline';
import * as animejs from 'animejs/lib/anime'
import {BufferGeometryUtils} from 'three/examples/jsm/utils/BufferGeometryUtils'
// Урок 2-7
import {TWEEN} from 'three/examples/jsm/libs/tween.module.min'

const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()

  const lightHolder = new THREE.Group();
  const geometry = new THREE.IcosahedronBufferGeometry(1.0,2);

  // Создание материала для икосахедрона (сферы)
  const materialIcosahedron = new THREE.MeshBasicMaterial({
    opacity: 1,
    transparent: true,
    //wireframe: true,
  });

  const aLight=new THREE.DirectionalLight(0xffffff,2);

  // Установка позиции для этого света
  aLight.position.set(-1.5,1.7,.7);

  // Прикрепляем к удержателю позиции света, чтобы он дальше не крутился вместе с объектами на сцене
  //!!! Раскомментируйте, если нужна «голубая сфера» | Код ниже добавляет Свет на сцену
  lightHolder.add(aLight);

  // Второй дополнительный свет
  const aLight2=new THREE.DirectionalLight(0xffffff,2);
  aLight2.position.set(-1.5,0.3,.7);
  //!!! Раскомментируйте, если нужна «голубая сфера» | Код ниже добавляет Свет на сцену
  lightHolder.add(aLight2);

  // Создание сферы, которую мы будем видеть — для скрытия заднего вида самой карты
  const geomHide = new THREE.SphereBufferGeometry(1.0499, 64, 36);
  const matHide=new THREE.MeshStandardMaterial({color:new THREE.Color(0x091e5a)});
  const meshHide= new THREE.Mesh(geomHide, matHide);

  //Добавляем объекты на сцену
  scene.add(meshHide);

  // Создание некоторого абстрактного объекта (переводится — сетка)
  const mesh = new THREE.Mesh(geometry,materialIcosahedron);
  // Установим родителя для всех элементов, к которым будет далее применена некоторая анимация...
  const parent=mesh;
  scene.add(lightHolder);

  /* !!!WARN!!! Planet 2-2 */
    scene.add(mesh) // Добавил основной прозрачный (скрытый от глаз объект на сцену), он послужит «родителем» для остальных...
    // Функция добавления данных на карту планеты
    function addMapInf(posCil1,posCir2,main=false){
      // Принимает парамерты://posCil1 => array(1,2,3)//posCil2 => array(1,2,3)//main => boolean
      let mainSize=null// если main = true, то значит это ПЕРВЫЙ «флагшток» (освновная позиция на карте)
      let mSC=null// размер круга под цилиндром
      let color=0x008DFB;//цвет по умолчанию — это цвет НЕглавных «флагштоков»
      if(main){// если это первый «флагшток»
          mainSize=[.004,.004,.3,3];
          mSC=[.017,24];
          color=0x86c3f9
      }else{ // если остальные флагштоки, то их размер чуть меньше основного
          mainSize=[.002,.002,.16,4]
          mSC=[.01,12]
      };
      // Создание цилиндра
      const cyl=new THREE.CylinderBufferGeometry(mainSize[0],mainSize[1],mainSize[2],mainSize[3]);
      const cylinder=new THREE.Mesh(
        cyl,
        new THREE.MeshBasicMaterial({color})
      );
      // Установим позицию цилиндра, которая приходит из заданных нами координат
      cylinder.position.set(posCil1[0],posCil1[1],posCil1[2]);
      parent.add(cylinder);// Добавим к родительскому элементу для дальнейшей анимации (в других уроках)
      // Видимо, далее по коду моей планеты, есть место, где мне необходим только лишь цилиндр (без круга внизу)
      if(posCir2==''){return [cylinder]}
      // Создаём окружность под цилиндром
      const circLocation = new THREE.CircleBufferGeometry(mSC[0],mSC[1]);
      // «Засунем» цилиндр в mesh и применим к нему материал...
      const circleLocation = new THREE.Mesh(
          circLocation,
          new THREE.MeshBasicMaterial({color, side: THREE.DoubleSide})
      );
      // Устанавливаем ему позицию — с помощью заранее определённых данных
      circleLocation.position.set(posCir2[0],posCir2[1],posCir2[2]);
      //Указываем ему «смотреть» в начало координат (нулевую точку), чтобы он как бы был над поверхностью планеты
      circleLocation.lookAt(new THREE.Vector3());
      // Добавляем окружность под цилиндром
      parent.add(circleLocation);
      // Функция возвращает два объекта в виде массива
      // Объекты представляют из себя ранее созданные 3D-объекты — JS Object
      return [cylinder,circleLocation]
    }
  /* \ !!!WARN!!! Planet 2-2 */

    /* !!!WARN!!! Planet 2-3 *//* Text */
    const fontLoader=new THREE.FontLoader();
    fontLoader.load('fonts/font-roboto.json', font =>{
        function createText(text,pos,rot,size,font,color=0xffffff){
          text=new String(text);
          const textGeo = new THREE.TextGeometry(text,{
            font,
            size,
            height: .004,
            curveSegments: 12
          } );
          const textMaterial=new THREE.MeshBasicMaterial({color,side:THREE.FrontSide});
          text=new THREE.Mesh(textGeo,textMaterial);
          text.position.set(pos[0],pos[1],pos[2]);
          text.rotation.set(rot[0],rot[1],rot[2]);
          /* text.updateMatrix(); */
          //scene.add(text);
          parent.add(text);
          return text;
      }

                  /* !!!WARN!!! Planet 2-8 */
                  const loader = new THREE.TextureLoader();
                  // load a resource
                  let meshTexture;
                  loader.load(
                      'media/pine-tree.png',
                      ( texture )=>{
                          const material = new THREE.MeshBasicMaterial({map: texture,side: THREE.DoubleSide,alphaTest:.5});
                          meshTexture = new THREE.Mesh(new THREE.PlaneGeometry(.235,.235),material);
                          meshTexture.position.set(.62,1,-.37);
                          meshTexture.rotation.set(0,1.95,0);
                          meshTexture.scale.set(0,0,0);
                          //scene.add(meshTexture)
                          parent.add(meshTexture)

                          const mainPos=[.662,.8,-.28];
                          const txt1=createText('3D',[.6,1.1,-.48],[0,1.95,0],.05,font)
                          const txt2=createText('Planet',[.6,1.0,-.48],[0,1.95,0],.05,font,0x0086ff);

                          const txt3=createText('One Test',[.617,.97,-.14],[0,1.95,0],.03,font);
                          const txt4=createText('Luxembourg',[.617,.91,-.14],[0,1.95,0],.03,font,0x84B3DF);
                              const txt5=createText('Two Test',[.88,.68,-.23],[0,1.95,0],.03,font);
                              const txt6=createText('Malta',[.88,.62,-.23],[0,1.95,0],.03,font,0x84B3DF);
                          const txt7=createText('Three Test',[.56,.89,.49],[0,1.2,0],.03,font);
                          const txt8=createText('London',[.56,.83,.49],[0,1.2,0],.03,font,0x84B3DF);
                              const txt9=createText('Four Test',[-0.7738271,.83213199,.228805],[0,-1.3,0],.03,font);
                              const txt10=createText('USA',[-0.7738271,.78213199,.228805],[0,-1.3,0],.03,font,0x84B3DF);
                          const txt11=createText('Five Test',[-.2,.9,.69],[0,-.4,0],.03,font);
                          const txt12=createText('USA',[-.2,.84,.69],[0,-.4,0],.03,font,0x84B3DF);
                              const txt13=createText('Six Test',[.245,.46,-.968],[0,3.1,0],.03,font);
                              const txt14=createText('Hong Kong',[.245,.41,-.968],[0,3.1,0],.03,font,0x84B3DF);
                          const txt15=createText('Seven Test',[.52,.11,-.915],[0,2.6,0],.03,font);
                          const txt16=createText('Singapore',[.52,.06,-.915],[0,2.6,0],.03,font,0x84B3DF);


                          /* animejs.timeline()
                          .add({
                            targets:meshTexture.scale,x:[0,.7],y:[0,.7],z:[0,1],duration:600,delay:600,easing:'linear',complete:()=>{
                              createMeshLine(createCurve({q:[.63,.84,-.13],w:[.7,.8,-.2],e:mainPos}))
                            }
                          })
                          .add({
                              targets:txt1.scale,x:[0,1],y:[0,1],z:[0,1],duration:600,easing:'linear'
                          }).add({
                              targets:txt2.scale,x:[0,1],y:[0,1],z:[0,1],duration:600,delay:1000,easing:'linear',complete:()=>{
                                  //(main)
                                  let c1=addMapInf([.66,.95,-.28],mainPos,true);
                                  animejs({targets:c1[0].scale,x:[0,1],y:[0,1],z:[0,1],duration:1000,delay:100,easing:'linear'});
                                  animejs({targets:c1[1].scale,x:[0,1],y:[0,1],z:[0,1],duration:1000,easing:'linear'});
                              }
                            }) */
                            animejs.timeline()
                            .add({
                              targets:meshTexture.scale,x:[0,.7],y:[0,.7],z:[0,1],duration:600,delay:600,easing:'linear'
                            })
                            .add({
                              targets:txt1.scale,x:[0,1],y:[0,1],z:[0,1],duration:600,easing:'linear'
                            })
                            .add({
                              targets:txt2.scale,x:[0,1],y:[0,1],z:[0,1],duration:600,easing:'linear',complete:()=>{
                                  //(main)
                                  let c1=addMapInf([.66,.95,-.28],mainPos,true);
                                  animejs({targets:c1[0].scale,x:[0,1],y:[0,1],z:[0,1],duration:1000,delay:100,easing:'linear'});
                                  animejs({targets:c1[1].scale,x:[0,1],y:[0,1],z:[0,1],duration:1000,easing:'linear'});
                              }
                          }).add({
                              targets:txt3.scale,x:[0,1],y:[0,1],z:[0,1],duration:600,easing:'linear'
                          }).add({//lux
                              targets:txt4.scale,x:[0,1],y:[0,1],z:[0,1],duration:600,easing:'linear',complete:()=>{
                                  createMeshLine(createCurve({q:[.63,.84,-.13],w:[.7,.8,-.2],e:mainPos}))
                                  const c2=addMapInf([.63,.92,-.13],[.63,.84,-.13]);
                                  animejs({targets:c2[0].scale,x:[0,1],y:[0,1],z:[0,1],duration:1000,delay:100,easing:'linear'});
                                  animejs({targets:c2[1].scale,x:[0,1],y:[0,1],z:[0,1],duration:1000,easing:'linear'});
                              }
                          }).add({
                              targets:txt5.scale,x:[0,1],y:[0,1],z:[0,1],duration:600,easing:'linear'
                          }).add({//Malta
                              targets:txt6.scale,x:[0,1],y:[0,1],z:[0,1],duration:600,easing:'linear',complete:()=>{
                                  createMeshLine(createCurve({q:[.89,.55,-.2139],w:[1,.7,-.3],e:mainPos}))
                                  const c4=addMapInf([.89,.63,-.2139],[.89,.55,-.2139]);
                                  animejs({targets:c4[0].scale,x:[0,1],y:[0,1],z:[0,1],duration:1000,delay:100,easing:'linear'});
                                  animejs({targets:c4[1].scale,x:[0,1],y:[0,1],z:[0,1],duration:1000,easing:'linear'});
                              }
                          }).add({
                              targets:txt7.scale,x:[0,1],y:[0,1],z:[0,1],duration:600,easing:'linear'
                          }).add({//lond
                              targets:txt8.scale,x:[0,1],y:[0,1],z:[0,1],duration:600,easing:'linear',complete:()=>{
                                  createMeshLine(createCurve({q:[.54,.75,.5],w:[.8,1,.2],e:mainPos}))
                                  const c3=addMapInf([.54,.83,.5],[.54,.75,.5]);
                                  animejs({targets:c3[0].scale,x:[0,1],y:[0,1],z:[0,1],duration:1000,delay:100,easing:'linear'});
                                  animejs({targets:c3[1].scale,x:[0,1],y:[0,1],z:[0,1],duration:1000,easing:'linear'});
                              }
                          }).add({
                              targets:txt11.scale,x:[0,1],y:[0,1],z:[0,1],duration:600,easing:'linear',delay:25000
                          }).add({//usa 2
                              targets:txt12.scale,x:[0,1],y:[0,1],z:[0,1],duration:600,easing:'linear',complete:()=>{
                                  createMeshLine(createCurve({q:[-0.2138805, 0.773827135, 0.692131996],w:[.9,.9,1.2],e:mainPos}))
                                  const c6=addMapInf([-.2139,.85,.6921],[-0.2138805, 0.773827135, 0.692131996]);
                                  animejs({targets:c6[0].scale,x:[0,1],y:[0,1],z:[0,1],duration:1000,delay:2000,easing:'linear'});
                              }
                          }).add({
                              targets:txt9.scale,x:[0,1],y:[0,1],z:[0,1],duration:600,easing:'linear',delay:31000
                          }).add({//usa
                              targets:txt10.scale,x:[0,1],y:[0,1],z:[0,1],duration:600,easing:'linear',complete:()=>{
                                  createMeshLine(createCurve({q:[-.7738271,.69213199,.21388055],w:[.5,1.6,1.2],e:mainPos}))
                                  const c5=addMapInf([-0.7738271,.777,.2138805],[-.7738271,.69213199,.21388055]);
                                  animejs({targets:c5[0].scale,x:[0,1],y:[0,1],z:[0,1],duration:1000,delay:2000,easing:'linear'});
                              }
                          }).add({
                             targets:txt13.scale,x:[0,1],y:[0,1],z:[0,1],duration:600,easing:'linear',delay:51000
                          }).add({//hong
                              targets:txt14.scale,x:[0,1],y:[0,1],z:[0,1],duration:600,easing:'linear',complete:()=>{
                                  createMeshLine(createCurve({q:[.25,.33,-.968],w:[.6,1,-1.5],e:mainPos}))
                                  const c7=addMapInf([.25,.41,-.968],[.25,.33,-.968]);
                                  animejs({targets:c7[0].scale,x:[0,1],y:[0,1],z:[0,1],duration:1000,delay:100,easing:'linear'});
                                  animejs({targets:c7[1].scale,x:[0,1],y:[0,1],z:[0,1],duration:1000,easing:'linear'});
                              }
                          }).add({
                         targets:txt15.scale,x:[0,1],y:[0,1],z:[0,1],duration:600,delay:15000,easing:'linear'
                      }).add({//Singapore
                             targets:txt16.scale,x:[0,1],y:[0,1],z:[0,1],duration:600,easing:'linear',complete:()=>{
                                  createMeshLine(createCurve({q:[.53,-.02,-.92],w:[1,1.2,-1],e:mainPos}))
                                  const c8=addMapInf([.53,.06,-.915],[.53,-.02,-.92]);
                                  animejs({targets:c8[0].scale,x:[0,1],y:[0,1],z:[0,1],duration:1000,delay:100,easing:'linear'});
                                  animejs({targets:c8[1].scale,x:[0,1],y:[0,1],z:[0,1],duration:1000,easing:'linear'});
                             }
                          });

                      },
                      undefined,
                      function(e){console.error( e )}
                  );
                  /* \ !!!WARN!!! Planet 2-8 */
    });//\TEXT+
    /* \ !!!WARN!!! Planet 2-3 */
        /* !!!WARN!!! Planet 2-5 */// Массив точек для «бум»
        const circlePointsAr=[//(main)
          [.662,.775,-.28],
          [.63,.84,-.13],//lux
          [.89,.55,-.2139],
          [.54,.75,.5],//Lond
          [-.2138805, .773827135, .692131996],//usa 2
          [-.7738271,.69213199,.21388055],//usa
          [.25,.33,-.968],//hong
          [.53,-.02,-.92]
      ];

        let meshCircles=null; // Переменная для самой карты
        /* Строим саму карту планеты из «кружочков» */
        const obj={};// Создадим объект, чтобы в него «складывать» переменные
        obj.w=360;// Обозначим кратную размеру map.png ширину будущего canvas
        obj.h=180;// ~ высоту ~
        obj.d=document;// Для псевдонима document (чтобы каждый раз его не писать)
        obj.c=obj.d.createElement('canvas');// Создание canvas, в который будем помещать точки из PNG изображения и брать их для нашей карты планеты
        obj.cnt=obj.c.getContext('2d');// Установим контекст 2d, а не webgl
        obj.c.width=obj.w;// Ширина canvas
        obj.c.height=obj.h;// Высота ~
        obj.c.classList.add('tmpCanvas');// Добавим класс для нового объекта canvas в HTML коде страницы, чтобы обратиться к нему далее
        obj.d.body.appendChild(obj.c);// Добавим его в документ
    
        obj.s=obj.d.createElement('style');// Создадим стиль
        obj.s.innerText=`.tmpCanvas{position:absolute;z-index:-9;width:0;height:0;overflow:hidden}`;// Сам CSS-код позиционирования нового canvas — скрываем его с глаз
        obj.d.body.appendChild(obj.s);// Добавляем стили в document
        obj.img=new Image();// Создадим объект класса Image (нативный JS)
        obj.img.src='media/map.png';// Присвоем ему путь к изображению
        obj.img.onload=()=>{// Когда загрузится... выполним код ниже
            obj.cnt.drawImage(obj.img,0,0,obj.w,obj.h) // Нарисуем изображение на canvas из PNG файла
            obj.data = obj.cnt.getImageData(0, 0, obj.w, obj.h)  
            obj.data = obj.data.data;// Возьмём точки из canvas
            obj.ar=[];
            // ** Код ниже для shader
            const impacts = [];// Некий пустой массив, куда будут добавлены данные с координатами «бум»
            for (let i = 0; i < circlePointsAr.length; i++) {// пройдёмся по заранее указанным точкам
                impacts.push({// Добавим в массив для шейдера данные
                  // позиция «бума»
                    impactPosition:new THREE.Vector3(circlePointsAr[i][0],circlePointsAr[i][1],circlePointsAr[i][2]),
                  //радиус бума (задаётся случайное число от 0.0001 до 0.002)
                    impactMaxRadius: THREE.Math.randFloat(0.0001, 0.002),
                  // некоторый коэфициент
                    impactRatio: .01
                });
            }
            // необходимо для шейдера
            let uniforms = {
              // передаём этому объекту «impacts» данные из массива «impacts»
                impacts: {value: impacts}
            }
            // \ **
            // Важный код. Наполним массив точками из данных из canvas
            for(let y = 0; y < obj.w; y++) {// по оси Y
                for(let x = 0; x < obj.w; x++) {// по оси X
                    const a=obj.data[((obj.w*y)+x)*4+3];// берём только n-нные значения
                    if(a>200){
                        obj.ar.push([x-obj.w,y-obj.w/6.2])// здесь 6.2 — это как бы «отступ от севера»
                    }
                }
            }
            // https://r105.threejsfundamentals.org/threejs/lessons/threejs-optimize-lots-of-objects.html
            // RU: https://stepik.org/lesson/582241/step/1?unit=576975
            const lonHelper = new THREE.Object3D();
            scene.add(lonHelper);
            // We rotate the latHelper on its X axis to the latitude
            const latHelper = new THREE.Object3D();
            lonHelper.add(latHelper);
            // The position helper moves the object to the edge of the sphere
            const positionHelper = new THREE.Object3D();
            positionHelper.position.z = .5;
            // positionHelper.position.z = Math.random();
            latHelper.add(positionHelper);
            // Used to move the center of the cube so it scales from the position Z axis
            const originHelper = new THREE.Object3D();
            originHelper.position.z=.5;
            positionHelper.add(originHelper);
            const lonFudge=Math.PI*.5;
            const latFudge=Math.PI*-0.135;
            const geometries=[];
            obj.nAr=[];
            obj.counter=0;
            obj.counter2=0;
            // Материал с шейдером, который поможет скруглить PlaneBufferGeometry и анимировать, сделать «бум»
            const materialCircles=new THREE.MeshBasicMaterial({
                //color:0xffffff, // Можно НЕ указывать здесь цвет, так как он формируется FragmentShader'ом
                side:THREE.FrontSide,// Видимая часть — передняя (THREE.FrontSide) | THREE.DoubleSide | THREE.BackSide
                onBeforeCompile: shader => {// позиционный или точечный шейдер
                    shader.uniforms.impacts = uniforms.impacts;
                    shader.vertexShader = `
            struct impact {
              vec3 impactPosition;
              float impactMaxRadius;
              float impactRatio;
            };
            uniform impact impacts[${circlePointsAr.length}];
            attribute vec3 center;
            ${shader.vertexShader}
          `.replace(
                        `#include <begin_vertex>`,
                        `#include <begin_vertex>
            float finalStep = 0.0;
            for (int i = 0; i < ${circlePointsAr.length};i++){
              float dist = distance(center, impacts[i].impactPosition);
              float curRadius = impacts[i].impactMaxRadius * impacts[i].impactRatio/2.;
              float sstep = smoothstep(0., curRadius*1.8, dist) - smoothstep(curRadius - ( .8 * impacts[i].impactRatio ), curRadius, dist);
              sstep *= 1. - impacts[i].impactRatio;
              finalStep += sstep;
            }
            finalStep = clamp(finalStep*.5, 0., 1.);
            transformed += normal * finalStep * 0.25;
            `);
                    //console.log(shader.vertexShader);
                    // Этот кусочек кода отвечает за «цветовой» шейдер, который и будет скруглять наш PlaneBufferGeometry
                    // и задавать ему определённый цвет
                    shader.fragmentShader = shader.fragmentShader.replace(
                        `vec4 diffuseColor = vec4( diffuse, opacity );`,
                        `
            if (length(vUv - 0.5) > 0.5) discard;
            vec4 diffuseColor = vec4( vec3(.7,.7,.7), 1.0 );
            `);
                }
    
            });
            materialCircles.defines = {"USE_UV" : ""};//https://www.khronos.org/webgl/wiki/WebGL_and_OpenGL_Differences
    
            let uty0=0
            // Проходимся по массиву наших точек («кружочков»)
            obj.ar.forEach(e=>{
                uty0++
                obj.counter2++;
                const geometry=new THREE.PlaneBufferGeometry(0.005,0.005);
                // Позиционирование «кружочков»
                // +15 — вращаем на 15 градусов западнее, хотя это можно было сделать иначе — вращать уже весь объект, а не каждый из «кружочков»
                // degToRad — https://threejs.org/docs/#api/en/math/MathUtils.degToRad
                lonHelper.rotation.y = THREE.MathUtils.degToRad(e[0])+lonFudge+15;
                const w=latHelper.rotation.x = THREE.MathUtils.degToRad(e[1])+latFudge;
                if(w-obj.prewLatX===0/*&&obj.counter2%2==0*/){
                    originHelper.updateWorldMatrix(true,false);// ЭТА
                    geometry.applyMatrix4(originHelper.matrixWorld);// и ЭТА штуки необходимы для обновления позиции отдельного «кружочка»
                    // Код ниже для анимирования «бум»
                    geometry.setAttribute("center", new THREE.Float32BufferAttribute(geometry.attributes.position.array, 3));
                    // Добавим вновь созданный «кружочек» в массив
                    geometries.push(geometry);
                }
                obj.prewLatX=w;
            });
            //Сформируем лишь одну буферную геометрию (которая по-идее должна обрабатываться на видео карте)
            //из массива ранее сформированных «кружочков»
            const geometryCircles = BufferGeometryUtils.mergeBufferGeometries(geometries, false);
            meshCircles = new THREE.Mesh(geometryCircles, materialCircles);
            // ниже тестовый материал, чтобы можно было увидеть НЕ «кружочки», а реальные PlaneBufferGeometry
            //meshCircles = new THREE.Mesh(geometryCircles, new THREE.MeshBasicMaterial({color:0xffffff}));

            // Добавим на сцену наш новый объект (саму карту)
            //scene.add(meshCircles);

            //Добавим новый объект (саму карту) к родительскому элементу
            parent.add(meshCircles);

            // Немного увеличим наш новый объект, чтобы все «кружочки» были над поверхностью планеты
            meshCircles.scale.set(1.051,1.051,1.051)
            obj.c.remove();// Удалим временный canvas из которого брали точки
            obj.s.remove()// Удалим временные стили
              /* !!!WARN!!! Planet 2-7 (продолжение 2-5) */
                const tweens2 = [];// Некий массив для анимаций (твинов)
                for (let i = 0; i < circlePointsAr.length; i++) {// проходимся по массиву с заранее заданным точками «бума»
                    tweens2.push({// добавляем в массив анимаций эту точку и указываем, что именно анимировать
                        runTween:()=>{
                            const tween=new TWEEN.Tween({value:0})
                                .to(
                                  { value: 1 },// желательно оставиь 1
                                  THREE.Math.randInt(2500,5000) // формируем некое случайное числов от 2500 до 5000 — время анимации «бум» | попробуйте поставить 5000, 15000
                                )
                                .onUpdate(val=>{// во время обновления также меняем коэффициент
                                    uniforms.impacts.value[i].impactRatio = val.value;
                                })
                                .onComplete(()=>{
                                    uniforms.impacts.value[i].impactPosition=new THREE.Vector3(circlePointsAr[i][0],circlePointsAr[i][1],circlePointsAr[i][2]);// указываем позицию из заранее опредеёлнных точек
                                    uniforms.impacts.value[i].impactMaxRadius = 5 * THREE.Math.randFloat(0.5, 0.75);
                                    tweens2[i].runTween();// указываем расстояние, на сколько будет разлетаться «бум» | попробуйте поставить 0.75,1.2
                                });
                            tween.start();//запускаем эту анимацию
                        }
                    });
                }
                tweens2.forEach(t=>{t.runTween()});// запускаем цепочку анимаций
              /* \ !!!WARN!!! Planet 2-7 */
          }
        /* \ !!!WARN!!! Planet 2-5 */
          /* !!!WARN!!! Planet 2-6 */
            // Функция создания точек для передачи в MeshLine и создании на их основе линий
            // Принимает в себя объект, в котором есть три точки {q:[x,y,z],w:[x,y,z],e:[x,y,z]}
            //Curve
            function createCurve(q){
              // Эти штуки необходимы для позиционирования над поверхностью планеты
              const lonHelper = new THREE.Object3D();
              scene.add(lonHelper);
              // We rotate the latHelper on its X axis to the latitude
              const latHelper = new THREE.Object3D();
              lonHelper.add(latHelper);
              // The position helper moves the object to the edge of the sphere
              const positionHelper = new THREE.Object3D();
              positionHelper.position.z = .5;
              latHelper.add(positionHelper);
              // Used to move the center of the cube so it scales from the position Z axis
              const originHelper = new THREE.Object3D();
              originHelper.position.z = 0.5;
              positionHelper.add(originHelper);
              // QuadraticBezierCurve3 — создаёт из трёх и более точек кривую Безье
              const curve = new THREE.QuadraticBezierCurve3(
                  new THREE.Vector3(q.q[0],q.q[1],q.q[2]),
                  new THREE.Vector3(q.w[0],q.w[1],q.w[2]),
                  new THREE.Vector3(q.e[0],q.e[1],q.e[2])
              );
              // Возвращаю константу, хотя можно было и просто возвратить результат. Здесь просто её можно залогировать, чтобы понять, что происходит
              const pointsCurve = curve.getPoints(24);
              // ... например, так:
              // console.log(pointsCurve)
              return pointsCurve;
            }//\Curve
            const lineMesh=[]; // Это будет массив, где будут находиться все линии, чтобы анимировать их
            // Функция создания самой линии (MeshLine)
            // Принимает в себя значение результата выполнения функции выше
            // а именно точки Vector3 (из кривой Безье)
            function createMeshLine(dataFromCreateCurve,flat=null){
                // Строим геометрию
                // Здесь я делаю цвета линий немного разными, чтобы разнообразить их
                let color=new THREE.Color(.2,THREE.Math.randFloat(.5,.8),1);
                let dashRatio=.5,
                    lineWidth=.005
                if(flat){// это линии, которые белые — летят из нашего центра в другие стороны, в отличии от синих линий, которые летят К ЦЕНТРУ (нашему условному центру)
                    color=new THREE.Color(0xffffff);
                    dashRatio=.9
                    lineWidth=.003
                }
                const line = new MeshLine();// экземпляр MeshLine
                line.setGeometry(dataFromCreateCurve);// Передаём ему геометрию из функции выше
                const geometryl = line.geometry;
                // Построить материал с параметрами, чтобы оживить его.
                const materiall = new MeshLineMaterial({
                    transparent: true, // Необходимо, чтобы была видна анимация, если false, то линия просто будет залита определённым цветом и не будет видна анимация
                    lineWidth,
                    color,
                    dashArray: 2, // всегда должен быть
                    dashOffset: 0, // начать с dash к zero
                    dashRatio, // видимая минута ряда длины. Мин: 0.5, Макс: 0.99
                });
                // Построение сетки
                const lineMeshMat = new THREE.Mesh(geometryl, materiall);// Создаём саму линию (Mesh)
                lineMeshMat.lookAt(new THREE.Vector3())// Здесь можно и не писать это
                parent.add(lineMeshMat); // Добавим её на сцену
                //parent.add(lineMeshMat);
                lineMesh.push(lineMeshMat); // Добавим эту одну линию, созданную выше, в массив для их анимаций
            }
            // Позиция основной точки нашей планеты (где сейчас «флагшток»)
            const mainPos=[.662,.8,-.28];
          /* \ !!!WARN!!! Planet 2-6 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})
  // Камера
  const camera = new THREE.PerspectiveCamera(12,window.innerWidth / window.innerHeight,.01,100);
  // Позиция камеры
  camera.position.set(10.5,4,-3.5);
  //Как ей «смотреть» — смещаем «куда» она смотрит
  camera.setViewOffset(10, 10, -2, .5, 9, 9)

// Controls
 const controls = new OrbitControls(camera, canvas)
 controls.enableDamping = true
 controls.dampingFactor = .01;

 controls.minPolarAngle =1.2;
 controls.maxPolarAngle = 1.2;


const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias:true
})

camera.aspect = sizes.width / sizes.height
camera.updateProjectionMatrix()

// Update renderer
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor('#000', 1);

const clock = new THREE.Clock()
const tick = () =>
{

    const elapsedTime = clock.getElapsedTime()

    // Update objects
    mesh.rotation.y = elapsedTime / 20

    /* function rotateRadians(deg){
      return deg * (Math.PI / 180);
    }
    animejs({
      loop: true,
      targets: mesh.rotation,
      // z: [rotateRadians(360), rotateRadians(0)],
      //x: [rotateRadians(360), rotateRadians(0)],
      y: [rotateRadians(-360), rotateRadians(360)],
      duration: 2000,
      easing: "linear"
    }); */

    // Render
    renderer.render(scene, camera)

    lightHolder.quaternion.copy(camera.quaternion);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)


    lineMesh.forEach(e=>{
        e.material.uniforms.dashOffset.value -= 0.01
    });
    TWEEN.update();
}

tick();

const d_=document;
const s_=d_.createElement('style');
s_.innerText=`
body{margin:0;overflow:hidden}
`;
d_.body.appendChild(s_)