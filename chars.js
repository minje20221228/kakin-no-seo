// ============================================================
// 낙인의 덱 — 픽셀아트 캐릭터 (24x32 grid)
// ============================================================
function pixelSVG(pixels, scale) {
    scale = scale || 4;
    let w = 24, h = 32; // 논리 크기 (viewBox)
    let rects = pixels.map(function(px){
        return '<rect x="'+px[0]+'" y="'+px[1]+'" width="1" height="1" fill="'+px[2]+'"/>';
    }).join('');
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+w+' '+h+'" style="image-rendering:pixelated;display:block;" shape-rendering="crispEdges">'+rects+'</svg>';
}

// ══ 성전사 (남/청철갑옷/십자방패/대검) ══
function makePaladinSVG(scale) {
    scale=scale||4; let px=[]; function p(x,y,c){px.push([x,y,c]);}
    let SK='#f5c88a',SD='#c8986a',HA='#2e1a0a',HAL='#5c3a1a';
    let AR='#3d6e8c',ARL='#5ea8d0',ARD='#1c3d52',ARM='#2a5570';
    let GL='#d4a820',GLD='#9a7010',GLL='#f0cc50';
    let SW='#c8ccd4',SWD='#8090a0',SWL='#e8ecf4';
    let SH='#c8a840',SHD='#7a6020',SHL='#e8c860',SHR='#8b1a1a';
    let BT='#1a3050',BTL='#2a4870',BTD='#0d1e30';
    let EY='#1a0a00',WH='#ffffff',LIP='#c06858';
    // 투구
    p(9,0,ARD);p(10,0,ARD);p(11,0,GL);p(12,0,GL);p(13,0,ARD);p(14,0,ARD);
    p(8,1,ARM);p(9,1,AR);p(10,1,ARL);p(11,1,AR);p(12,1,AR);p(13,1,ARL);p(14,1,AR);p(15,1,ARM);
    p(7,2,ARD);p(8,2,ARM);p(9,2,AR);p(10,2,ARL);p(11,2,AR);p(12,2,AR);p(13,2,ARL);p(14,2,AR);p(15,2,ARM);p(16,2,ARD);
    p(7,3,ARD);p(8,3,AR);p(9,3,AR);p(10,3,AR);p(11,3,AR);p(12,3,AR);p(13,3,AR);p(14,3,AR);p(15,3,AR);p(16,3,ARD);
    // 얼굴
    p(8,4,ARD);p(9,4,SK);p(10,4,SK);p(11,4,SK);p(12,4,SK);p(13,4,SK);p(14,4,SK);p(15,4,ARD);
    p(8,5,ARD);p(9,5,SK);p(10,5,EY);p(11,5,WH);p(12,5,SK);p(13,5,WH);p(14,5,EY);p(15,5,ARD);
    p(8,6,ARD);p(9,6,SK);p(10,6,SK);p(11,6,SK);p(12,6,SK);p(13,6,SK);p(14,6,SK);p(15,6,ARD);
    p(9,7,SD);p(10,7,SK);p(11,7,LIP);p(12,7,SK);p(13,7,SK);p(14,7,SD);
    p(10,8,SD);p(11,8,HAL);p(12,8,HAL);p(13,8,SD);
    // 목·어깨
    p(10,9,SK);p(11,9,SK);p(12,9,SK);p(13,9,SK);
    p(5,10,ARD);p(6,10,ARL);p(7,10,AR);p(8,10,GL); p(14,10,GL);p(15,10,AR);p(16,10,ARL);p(17,10,ARD);
    p(9,10,AR);p(10,10,SK);p(11,10,SK);p(12,10,SK);p(13,10,AR);
    // 몸통
    p(7,11,AR);p(8,11,ARL);p(9,11,AR);p(10,11,ARM);p(11,11,GL);p(12,11,GL);p(13,11,ARM);p(14,11,AR);p(15,11,ARL);p(16,11,AR);
    p(7,12,ARD);p(8,12,AR);p(9,12,ARL);p(10,12,AR);p(11,12,AR);p(12,12,AR);p(13,12,AR);p(14,12,ARL);p(15,12,AR);p(16,12,ARD);
    p(7,13,ARM);p(8,13,AR);p(9,13,ARL);p(10,13,GL);p(11,13,GL);p(12,13,GL);p(13,13,GL);p(14,13,ARL);p(15,13,AR);p(16,13,ARM);
    p(7,14,AR);p(8,14,ARD);p(9,14,AR);p(10,14,AR);p(11,14,ARM);p(12,14,ARM);p(13,14,AR);p(14,14,AR);p(15,14,ARD);p(16,14,AR);
    // 방패(왼)
    p(2,10,SHD);p(3,10,SH);p(4,10,SH);p(5,10,SHD);
    p(1,11,SHD);p(2,11,SH);p(3,11,SHL);p(4,11,SHR);p(5,11,SH);
    p(1,12,SHD);p(2,12,SHR);p(3,12,SH);p(4,12,SH);p(5,12,SHR);
    p(1,13,SHD);p(2,13,SH);p(3,13,SHL);p(4,13,SHR);p(5,13,SH);
    p(2,14,SHD);p(3,14,SH);p(4,14,SH);p(5,14,SHD);
    p(3,15,SHD);p(4,15,SHD);
    // 대검(오른)
    p(19,6,SWL);p(20,6,SWL);
    p(19,7,SW);p(20,7,SWD);p(19,8,SW);p(20,8,SWD);
    p(19,9,SWL);p(20,9,SW);p(19,10,SW);p(20,10,SWD);
    p(17,11,GLL);p(18,11,GL);p(19,11,GL);p(20,11,GLD);
    p(18,12,GL);p(19,12,GLD);p(18,13,GL);p(19,13,GLD);p(18,14,GLD);
    // 망토
    p(6,11,GL);p(6,12,GLD);p(6,13,GLD);p(6,14,GLD);p(6,15,GLD);
    p(17,11,GL);p(17,12,GLD);p(17,13,GLD);p(17,14,GLD);p(17,15,GLD);
    // 허리띠
    p(7,15,GLD);p(8,15,GL);p(9,15,GLL);p(10,15,GL);p(11,15,GL);p(12,15,GL);p(13,15,GLL);p(14,15,GL);p(15,15,GLD);
    // 하체 갑옷
    p(8,16,ARD);p(9,16,AR);p(10,16,ARL);p(11,16,AR);p(12,16,AR);p(13,16,ARL);p(14,16,AR);p(15,16,ARD);
    p(8,17,AR);p(9,17,ARD);p(10,17,ARL);p(11,17,AR);p(12,17,AR);p(13,17,ARL);p(14,17,ARD);p(15,17,AR);
    p(8,18,ARL);p(9,18,AR);p(10,18,ARD);p(11,18,AR);p(12,18,AR);p(13,18,ARD);p(14,18,AR);p(15,18,ARL);
    p(8,19,ARM);p(9,19,ARL);p(10,19,AR);p(11,19,ARD);p(12,19,ARD);p(13,19,AR);p(14,19,ARL);p(15,19,ARM);
    // 부츠
    p(8,20,BTL);p(9,20,BT);p(10,20,SK);p(11,20,SK);p(12,20,BT);p(13,20,BTL);
    p(8,21,BT);p(9,21,BTL);p(10,21,BT);p(11,21,BT);p(12,21,BTL);p(13,21,BT);
    p(7,22,BTD);p(8,22,BT);p(9,22,BTL);p(10,22,BT);p(11,22,BT);p(12,22,BTL);p(13,22,BT);p(14,22,BTD);
    p(7,23,BTD);p(8,23,BTD);p(9,23,BT);p(10,23,BT);p(11,23,BT);p(12,23,BT);p(13,23,BTD);p(14,23,BTD);
    return pixelSVG(px,scale);
}

// ══ 마법사 (여/보라로브/지팡이/별장식) ══
function makeMageSVG(scale) {
    scale=scale||4; let px=[]; function p(x,y,c){px.push([x,y,c]);}
    let SK='#f5c8a0',SD='#d0987a',HA='#8b2fc9',HAL='#c39bea',HAD='#5a1a88';
    let RB='#6b1fa8',RBL='#9b4fd8',RBD='#3d0e60',RBF='#c080f0';
    let ST='#8b6010',STL='#c08820',STD='#5a3e0a';
    let GM='#00d4ff',GML='#80eaff',GMD='#0090c0';
    let AC='#d4a820',ACL='#f0cc50';
    let EY='#2a0a50',WH='#ffffff',LIP='#e0608a';
    let ST2='#fff176';
    // 머리카락
    p(9,0,HAD);p(10,0,HA);p(11,0,HAL);p(12,0,HAL);p(13,0,HA);p(14,0,HAD);
    p(8,1,HAD);p(9,1,HA);p(10,1,HAL);p(11,1,HAL);p(12,1,HAL);p(13,1,HAL);p(14,1,HA);p(15,1,HAD);
    p(7,2,HA);p(8,2,HAL);p(9,2,HAL);p(10,2,HA);p(11,2,HA);p(12,2,HA);p(13,2,HAL);p(14,2,HAL);p(15,2,HA);p(16,2,HAD);
    p(11,0,ST2);p(12,0,ST2); // 별
    // 얼굴
    p(8,3,HAD);p(9,3,SK);p(10,3,SK);p(11,3,SK);p(12,3,SK);p(13,3,SK);p(14,3,SK);p(15,3,HAD);
    p(7,4,HA);p(8,4,SK);p(9,4,SK);p(10,4,SK);p(11,4,SK);p(12,4,SK);p(13,4,SK);p(14,4,SK);p(15,4,HA);
    p(7,5,HA);p(8,5,SK);p(9,5,EY);p(10,5,WH);p(11,5,SK);p(12,5,SK);p(13,5,WH);p(14,5,EY);p(15,5,HA);
    p(9,4,HAD);p(14,4,HAD);
    p(7,6,HA);p(8,6,SK);p(9,6,SK);p(10,6,SK);p(11,6,SK);p(12,6,SK);p(13,6,SK);p(14,6,SK);p(15,6,HA);
    p(8,7,SD);p(9,7,SK);p(10,7,LIP);p(11,7,LIP);p(12,7,SK);p(13,7,SK);p(14,7,SD);
    // 옆 머리
    p(7,4,HAD);p(7,5,HA);p(7,6,HA);p(7,7,HA);p(7,8,HAD);p(7,9,HA);p(7,10,HAD);
    p(16,4,HAD);p(16,5,HA);p(16,6,HA);p(16,7,HA);p(16,8,HAD);p(16,9,HA);p(16,10,HAD);
    // 목
    p(10,8,SK);p(11,8,SK);p(12,8,SK);p(13,8,SK);
    // 로브 상체
    p(7,9,RBD);p(8,9,RB);p(9,9,RBL);p(10,9,RBF);p(11,9,AC);p(12,9,AC);p(13,9,RBF);p(14,9,RBL);p(15,9,RB);p(16,9,RBD);
    p(6,10,RBD);p(7,10,RB);p(8,10,RBL);p(9,10,RBF);p(10,10,RB);p(11,10,RBD);p(12,10,RBD);p(13,10,RB);p(14,10,RBF);p(15,10,RBL);p(16,10,RB);p(17,10,RBD);
    p(6,11,RBD);p(7,11,RBL);p(8,11,RB);p(9,11,RBF);p(10,11,RBL);p(11,11,AC);p(12,11,AC);p(13,11,RBL);p(14,11,RBF);p(15,11,RB);p(16,11,RBL);p(17,11,RBD);
    p(6,12,RB);p(7,12,RBD);p(8,12,RBL);p(9,12,RB);p(10,12,RBF);p(11,12,RBF);p(12,12,RBF);p(13,12,RBF);p(14,12,RB);p(15,12,RBL);p(16,12,RBD);p(17,12,RB);
    p(6,13,RBD);p(7,13,RB);p(8,13,RBL);p(9,13,RBF);p(10,13,AC);p(11,13,AC);p(12,13,AC);p(13,13,AC);p(14,13,RBF);p(15,13,RBL);p(16,13,RB);p(17,13,RBD);
    // 지팡이(왼)
    p(2,3,GML);p(3,3,GM);p(4,3,GML);p(2,4,GMD);p(3,4,GML);p(4,4,GM);p(2,5,GM);p(3,5,GMD);
    p(3,6,STL);p(4,6,ST);p(3,7,ST);p(4,7,STD);p(3,8,STL);p(4,8,ST);p(3,9,ST);p(4,9,STD);
    p(3,10,STL);p(4,10,ST);p(3,11,ST);p(4,11,STD);p(3,12,STL);p(4,12,ST);p(3,13,ST);p(4,13,STD);
    p(3,14,STL);p(4,14,ST);p(3,15,ST);p(4,15,STD);
    // 로브 스커트
    p(5,14,RBD);p(6,14,RB);p(7,14,RBL);p(8,14,RBF);p(9,14,RBL);p(10,14,RBF);p(11,14,RBF);p(12,14,RBF);p(13,14,RBL);p(14,14,RBF);p(15,14,RBL);p(16,14,RB);p(17,14,RBD);p(18,14,RBD);
    p(4,15,RBD);p(5,15,RB);p(6,15,RBD);p(7,15,RBL);p(8,15,RB);p(9,15,RBF);p(10,15,RBF);p(11,15,RBF);p(12,15,RBF);p(13,15,RB);p(14,15,RBL);p(15,15,RBD);p(16,15,RBL);p(17,15,RB);p(18,15,RBD);p(19,15,RBD);
    p(4,16,RBD);p(5,16,RB);p(6,16,RBD);p(7,16,RB);p(8,16,RBL);p(9,16,RBF);p(10,16,RBF);p(11,16,RBF);p(12,16,RBF);p(13,16,RBL);p(14,16,RB);p(15,16,RBD);p(16,16,RB);p(17,16,RBD);p(18,16,RBD);
    p(4,17,RBD);p(5,17,RBD);p(6,17,RB);p(7,17,RBD);p(8,17,RB);p(9,17,RBL);p(10,17,RBF);p(11,17,RBF);p(12,17,RBL);p(13,17,RB);p(14,17,RBD);p(15,17,RB);p(16,17,RBD);p(17,17,RBD);
    p(5,18,RBD);p(6,18,RBD);p(7,18,RBD);p(8,18,RB);p(9,18,RBD);p(10,18,RBL);p(11,18,RBL);p(12,18,RBD);p(13,18,RB);p(14,18,RBD);p(15,18,RBD);p(16,18,RBD);
    p(6,19,RBD);p(7,19,RBD);p(8,19,RBD);p(9,19,RBD);p(10,19,RBD);p(11,19,RBD);p(12,19,RBD);p(13,19,RBD);p(14,19,RBD);p(15,19,RBD);
    // 발
    p(9,20,SK);p(10,20,SK);p(11,20,SK);p(12,20,SK);
    p(8,21,RBD);p(9,21,RBD);p(10,21,SK);p(11,21,SK);p(12,21,RBD);p(13,21,RBD);
    p(8,22,RBD);p(9,22,RBD);p(10,22,RBD);p(11,22,RBD);p(12,22,RBD);p(13,22,RBD);
    return pixelSVG(px,scale);
}

// ══ 레인저 (여/초록가죽/장궁/포니테일) ══
function makeRangerSVG(scale) {
    scale=scale||4; let px=[]; function p(x,y,c){px.push([x,y,c]);}
    let SK='#f5c8a0',SD='#d0987a',HA='#7a3a10',HAL='#b05a20',HAD='#4a2008';
    let AR='#2a6a2a',ARL='#4a9a4a',ARD='#163816',ARF='#80c880';
    let LT='#7a5020',LTL='#b07830',LTD='#4a2e10';
    let AC='#d4a820',ACL='#f0cc50';
    let BW='#8b6010',BWL='#c08820',BWD='#5a3e0a';
    let AR2='#c8c8c8',AR2L='#e8e8e8';
    let QV='#7a5020';
    let BT='#3a1e08',BTL='#5a3218',BTD='#1e0e04';
    let EY='#1a3a1a',WH='#ffffff',LIP='#d06878';
    let RD='#cc3333';
    // 머리카락
    p(9,0,HAD);p(10,0,HA);p(11,0,HAL);p(12,0,HAL);p(13,0,HA);p(14,0,HAD);
    p(8,1,HAD);p(9,1,HA);p(10,1,HAL);p(11,1,HAL);p(12,1,HAL);p(13,1,HA);p(14,1,HAD);p(15,1,HAD);
    p(8,2,HA);p(9,2,HAL);p(10,2,HA);p(11,2,HA);p(12,2,HA);p(13,2,HAL);p(14,2,HA);p(15,2,HAD);
    // 포니테일
    p(15,3,HA);p(16,3,HAL);p(16,4,HAL);p(16,5,HA);p(16,6,HAD);p(15,7,HA);p(15,8,HAD);p(15,9,HA);
    // 얼굴
    p(8,3,ARD);p(9,3,SK);p(10,3,SK);p(11,3,SK);p(12,3,SK);p(13,3,SK);p(14,3,SK);p(15,3,ARD);
    p(8,4,AR);p(9,4,SK);p(10,4,SK);p(11,4,SK);p(12,4,SK);p(13,4,SK);p(14,4,SK);p(15,4,AR);
    p(8,5,AR);p(9,5,SK);p(10,5,EY);p(11,5,WH);p(12,5,SK);p(13,5,WH);p(14,5,EY);p(15,5,AR);
    p(10,4,HA);p(13,4,HA);
    p(8,6,AR);p(9,6,SK);p(10,6,SK);p(11,6,SK);p(12,6,SK);p(13,6,SK);p(14,6,SK);p(15,6,AR);
    p(9,7,SD);p(10,7,SK);p(11,7,LIP);p(12,7,SK);p(13,7,SD);
    // 스카프
    p(9,8,RD);p(10,8,RD);p(11,8,RD);p(12,8,RD);p(13,8,RD);p(14,8,RD);
    p(8,9,RD);p(9,9,RD);p(13,9,RD);p(14,9,RD);
    // 목
    p(10,8,SK);p(11,8,SK);p(12,8,SK);p(13,8,SK);
    // 어깨+몸통
    p(6,10,LTD);p(7,10,LT);p(8,10,LTL);p(15,10,LTL);p(16,10,LT);p(17,10,LTD);
    p(8,10,AR);p(9,10,ARL);p(10,10,ARF);p(11,10,ARF);p(12,10,ARF);p(13,10,ARL);p(14,10,AR);
    p(7,11,ARD);p(8,11,AR);p(9,11,ARL);p(10,11,ARF);p(11,11,AC);p(12,11,AC);p(13,11,ARF);p(14,11,ARL);p(15,11,AR);p(16,11,ARD);
    p(7,12,AR);p(8,12,ARD);p(9,12,AR);p(10,12,ARL);p(11,12,ARF);p(12,12,ARF);p(13,12,ARL);p(14,12,AR);p(15,12,ARD);p(16,12,AR);
    p(7,13,ARD);p(8,13,AR);p(9,13,ARL);p(10,13,AR);p(11,13,AR);p(12,13,AR);p(13,13,AR);p(14,13,ARL);p(15,13,AR);p(16,13,ARD);
    p(7,14,AR);p(8,14,AR);p(9,14,ARD);p(10,14,ARL);p(11,14,ARF);p(12,14,ARF);p(13,14,ARL);p(14,14,ARD);p(15,14,AR);p(16,14,AR);
    // 활(왼)
    p(2,4,BWL);p(3,5,BW);p(3,6,BW);p(2,7,BWL);p(3,8,BW);p(3,9,BW);p(2,10,BWL);p(3,11,BW);p(3,12,BW);p(2,13,BWL);p(3,14,BW);p(3,15,BW);p(2,16,BWL);
    p(2,5,ACL);p(2,6,ACL);p(2,8,AC);p(2,9,ACL);p(2,11,ACL);p(2,12,ACL);p(2,14,AC);p(2,15,ACL);
    // 화살통+화살
    p(16,9,QV);p(17,9,QV);p(16,10,LTD);p(17,10,QV);p(16,11,QV);p(17,11,QV);p(16,12,LTD);p(17,12,QV);p(16,13,QV);p(17,13,QV);p(16,14,LTD);p(17,14,QV);
    p(15,8,AR2L);p(16,8,AR2);p(17,8,AR2);p(18,8,AR2);
    // 허리띠
    p(7,15,LTD);p(8,15,LT);p(9,15,LTL);p(10,15,AC);p(11,15,ACL);p(12,15,AC);p(13,15,LTL);p(14,15,LT);p(15,15,LTD);
    // 하의
    p(8,16,LTD);p(9,16,LT);p(10,16,LTL);p(11,16,LT);p(12,16,LT);p(13,16,LTL);p(14,16,LT);p(15,16,LTD);
    p(8,17,LT);p(9,17,LTD);p(10,17,LT);p(11,17,LTL);p(12,17,LTL);p(13,17,LT);p(14,17,LTD);p(15,17,LT);
    p(8,18,LTD);p(9,18,LT);p(10,18,LT);p(11,18,LTD);p(12,18,LTD);p(13,18,LT);p(14,18,LT);p(15,18,LTD);
    p(8,19,LT);p(9,19,LTL);p(10,19,LT);p(11,19,LT);p(12,19,LT);p(13,19,LT);p(14,19,LTL);p(15,19,LT);
    // 부츠
    p(8,20,BTL);p(9,20,BT);p(10,20,SK);p(11,20,SK);p(12,20,BT);p(13,20,BTL);
    p(8,21,BT);p(9,21,BTL);p(10,21,BT);p(11,21,BT);p(12,21,BTL);p(13,21,BT);
    p(7,22,BTD);p(8,22,BT);p(9,22,BTL);p(10,22,BT);p(11,22,BT);p(12,22,BTL);p(13,22,BT);p(14,22,BTD);
    p(7,23,BTD);p(8,23,BTD);p(9,23,BT);p(10,23,BT);p(11,23,BT);p(12,23,BT);p(13,23,BTD);p(14,23,BTD);
    return pixelSVG(px,scale);
}

// ══════════════════════════════════════════════
// 몬스터 픽셀아트 SVG — 24×24 그리드
// ══════════════════════════════════════════════

// ─ 공통 헬퍼 (몬스터용 정방형 그리드) ─
function monsterSVG(pixels, scale) {
    scale = scale || 5;
    let w = 24, h = 24; // 논리 크기
    let rects = pixels.map(function(px){
        return '<rect x="'+px[0]+'" y="'+px[1]+'" width="1" height="1" fill="'+px[2]+'"/>';
    }).join('');
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+w+' '+h+'" style="image-rendering:pixelated;display:block;" shape-rendering="crispEdges">'+rects+'</svg>';
}

// ── 1막: 고블린 (초록 코볼트 스타일) ──
function makeGoblinSVG(scale) {
    scale = scale || 5;
    let px = [];
    function p(x,y,c){px.push([x,y,c]);}
    let GN='#3a7a2a', GL='#5db84a', GD='#1e4d14', GF='#82e065';
    let SK='#d4a870', EY='#ff2200', WH='#fff';
    let BR='#7a4010', BRL='#b06020', WP='#c0c0c0', WPL='#e8e8e8';
    // 귀
    p(6,4,GD);p(5,5,GD);p(5,6,GN);p(6,5,GN);
    p(17,4,GD);p(18,5,GD);p(18,6,GN);p(17,5,GN);
    // 머리
    p(8,3,GD);p(9,3,GN);p(10,3,GN);p(11,3,GN);p(12,3,GN);p(13,3,GN);p(14,3,GN);p(15,3,GD);
    p(7,4,GN);p(8,4,GL);p(9,4,GL);p(10,4,GL);p(11,4,GL);p(12,4,GL);p(13,4,GL);p(14,4,GL);p(15,4,GL);p(16,4,GN);
    p(7,5,GN);p(8,5,GL);p(9,5,SK);p(10,5,SK);p(11,5,SK);p(12,5,SK);p(13,5,SK);p(14,5,GL);p(15,5,GL);p(16,5,GN);
    p(7,6,GN);p(8,6,GL);p(9,6,EY);p(10,6,WH);p(11,6,SK);p(12,6,SK);p(13,6,WH);p(14,6,EY);p(15,6,GL);p(16,6,GN);
    p(7,7,GN);p(8,7,GL);p(9,7,SK);p(10,7,SK);p(11,7,SK);p(12,7,SK);p(13,7,SK);p(14,7,SK);p(15,7,GL);p(16,7,GN);
    p(8,8,GN);p(9,8,SK);p(10,8,'#a05030');p(11,8,SK);p(12,8,SK);p(13,8,'#a05030');p(14,8,SK);p(15,8,GN);
    p(9,9,GD);p(10,9,GN);p(11,9,GN);p(12,9,GN);p(13,9,GN);p(14,9,GD);
    // 몸통
    p(8,10,GD);p(9,10,BR);p(10,10,BRL);p(11,10,BRL);p(12,10,BRL);p(13,10,BRL);p(14,10,BR);p(15,10,GD);
    p(7,11,GD);p(8,11,GN);p(9,11,BRL);p(10,11,BRL);p(11,11,BR);p(12,11,BR);p(13,11,BRL);p(14,11,BRL);p(15,11,GN);p(16,11,GD);
    p(7,12,GD);p(8,12,GN);p(9,12,GN);p(10,12,BRL);p(11,12,BRL);p(12,12,BRL);p(13,12,BRL);p(14,12,GN);p(15,12,GN);p(16,12,GD);
    p(7,13,GD);p(8,13,GN);p(9,13,GN);p(10,13,GN);p(11,13,BRL);p(12,13,BRL);p(13,13,GN);p(14,13,GN);p(15,13,GN);p(16,13,GD);
    // 팔
    p(6,11,GD);p(5,12,GD);p(5,13,GD);p(6,13,WP);p(5,14,WP);p(4,14,WP);
    p(17,11,GD);p(18,12,GD);p(18,13,WP);p(19,13,WP);p(19,14,WPL);
    // 다리
    p(9,14,GD);p(10,14,GN);p(11,14,GN);p(12,14,GN);p(13,14,GD);
    p(9,15,GD);p(10,15,GN);p(11,15,GD);p(12,15,GN);p(13,15,GD);
    p(9,16,BR);p(10,16,BR);p(12,16,BR);p(13,16,BR);
    p(8,17,BR);p(9,17,BRL);p(10,17,BRL);p(12,17,BRL);p(13,17,BRL);p(14,17,BR);
    return monsterSVG(px, scale);
}

// ── 2막: 리치 (언데드 마법사, 보라/어둠) ──
function makeLichSVG(scale) {
    scale = scale || 5;
    let px = [];
    function p(x,y,c){px.push([x,y,c]);}
    let RB='#5a1a8a', RL='#9b4fd8', RD='#2d0a50', RF='#c080f0';
    let BN='#c8b890', BND='#8a8060'; // 뼈
    let PU='#8800cc', EY='#ff00ff', WH='#ffffff';
    let GL='#d4a820', GD='#9a7010';
    // 후드
    p(8,1,RD);p(9,1,RB);p(10,1,RB);p(11,1,RB);p(12,1,RB);p(13,1,RB);p(14,1,RB);p(15,1,RD);
    p(7,2,RD);p(8,2,RB);p(9,2,RL);p(10,2,RL);p(11,2,RL);p(12,2,RL);p(13,2,RL);p(14,2,RL);p(15,2,RB);p(16,2,RD);
    p(6,3,RD);p(7,3,RB);p(8,3,RD);p(9,3,RD);p(10,3,RB);p(11,3,RB);p(12,3,RB);p(13,3,RB);p(14,3,RD);p(15,3,RD);p(16,3,RB);p(17,3,RD);
    p(6,4,RD);p(7,4,RB);p(8,4,RD);p(9,4,BN);p(10,4,BN);p(11,4,BN);p(12,4,BN);p(13,4,BN);p(14,4,BN);p(15,4,RD);p(16,4,RB);p(17,4,RD);
    // 해골 얼굴
    p(9,5,BND);p(10,5,BN);p(11,5,BN);p(12,5,BN);p(13,5,BN);p(14,5,BND);
    p(9,6,BN);p(10,6,EY);p(11,6,WH);p(12,6,WH);p(13,6,EY);p(14,6,BN);
    p(9,7,BN);p(10,7,BN);p(11,7,BN);p(12,7,BN);p(13,7,BN);p(14,7,BN);
    p(9,8,BND);p(10,8,BN);p(11,8,RD);p(12,8,RD);p(13,8,BN);p(14,8,BND);
    p(10,9,BND);p(11,9,BND);p(12,9,BND);p(13,9,BND);
    // 로브 몸통
    p(6,9,RD);p(7,9,RB);p(8,9,RB);p(9,9,RL);p(10,9,RF);p(11,9,GL);p(12,9,GL);p(13,9,RF);p(14,9,RL);p(15,9,RB);p(16,9,RB);p(17,9,RD);
    p(5,10,RD);p(6,10,RB);p(7,10,RL);p(8,10,RF);p(9,10,RL);p(10,10,RB);p(11,10,RD);p(12,10,RD);p(13,10,RB);p(14,10,RL);p(15,10,RF);p(16,10,RL);p(17,10,RB);p(18,10,RD);
    p(5,11,RD);p(6,11,RB);p(7,11,RL);p(8,11,RF);p(9,11,RF);p(10,11,RL);p(11,11,GL);p(12,11,GL);p(13,11,RL);p(14,11,RF);p(15,11,RF);p(16,11,RL);p(17,11,RB);p(18,11,RD);
    // 마법진 오브
    p(10,12,PU);p(11,12,EY);p(12,12,EY);p(13,12,PU);
    p(9,13,PU);p(10,13,EY);p(11,13,WH);p(12,13,WH);p(13,13,EY);p(14,13,PU);
    p(10,14,PU);p(11,14,EY);p(12,14,EY);p(13,14,PU);
    // 하의
    p(6,12,RD);p(7,12,RB);p(8,12,RL);p(9,12,RL);
    p(14,12,RL);p(15,12,RL);p(16,12,RB);p(17,12,RD);
    p(5,13,RD);p(6,13,RB);p(7,13,RB);p(8,13,RL);
    p(15,13,RL);p(16,13,RB);p(17,13,RB);p(18,13,RD);
    p(4,14,RD);p(5,14,RB);p(6,14,RD);
    p(17,14,RD);p(18,14,RB);p(19,14,RD);
    p(5,15,RD);p(6,15,RB);p(7,15,RB);p(8,15,RB);p(9,15,RL);p(10,15,RL);p(11,15,RL);p(12,15,RL);p(13,15,RL);p(14,15,RL);p(15,15,RB);p(16,15,RB);p(17,15,RB);p(18,15,RD);
    return monsterSVG(px, scale);
}

// ── 3막: 보라 드래곤 (이미지 느낌 — 날개, 눈, 발톱) ──
function makeDragonSVG(scale) {
    scale = scale || 5;
    let px = [];
    function p(x,y,c){px.push([x,y,c]);}
    let PU='#7b1fa2', PL='#ce93d8', PD='#4a148c', PF='#e040fb';
    let GD='#d4a820', GL='#f0cc50', EY='#ff00ff', WH='#ffffff', RD='#d50000';
    let SC='#ab47bc', SD='#6a1b9a';

    // 날개 (왼쪽)
    p(0,5,PD);p(1,4,PD);p(1,5,PU);p(2,4,PD);p(2,5,PU);p(2,6,PU);
    p(1,6,PU);p(0,7,PD);p(1,7,PU);p(2,7,PU);p(3,7,PU);
    p(0,8,PD);p(1,8,PU);p(2,8,PL);p(3,8,PL);p(0,9,PD);p(1,9,PL);p(2,9,PL);p(3,9,PL);
    p(1,10,PD);p(2,10,PU);p(3,10,PL);p(4,10,PL);
    p(2,11,PD);p(3,11,PU);p(4,11,PL);p(5,11,PL);
    p(1,12,PD);p(2,12,PD);p(3,12,PU);p(4,12,PU);p(5,12,PL);

    // 날개 (오른쪽)
    p(23,5,PD);p(22,4,PD);p(22,5,PU);p(21,4,PD);p(21,5,PU);p(21,6,PU);
    p(22,6,PU);p(23,7,PD);p(22,7,PU);p(21,7,PU);p(20,7,PU);
    p(23,8,PD);p(22,8,PU);p(21,8,PL);p(20,8,PL);p(23,9,PD);p(22,9,PL);p(21,9,PL);p(20,9,PL);
    p(22,10,PD);p(21,10,PU);p(20,10,PL);p(19,10,PL);
    p(21,11,PD);p(20,11,PU);p(19,11,PL);p(18,11,PL);
    p(22,12,PD);p(21,12,PD);p(20,12,PU);p(19,12,PU);p(18,12,PL);

    // 머리
    p(9,1,PD);p(10,1,PU);p(11,1,PU);p(12,1,PU);p(13,1,PU);p(14,1,PD);
    p(8,2,PD);p(9,2,PU);p(10,2,PL);p(11,2,PL);p(12,2,PL);p(13,2,PL);p(14,2,PU);p(15,2,PD);
    // 뿔
    p(9,0,GD);p(8,1,GL);p(14,0,GD);p(15,1,GL);
    // 눈
    p(8,3,PD);p(9,3,PU);p(10,3,EY);p(11,3,WH);p(12,3,PL);p(13,3,WH);p(14,3,EY);p(15,3,PU);p(16,3,PD);
    // 턱
    p(8,4,PD);p(9,4,PL);p(10,4,PU);p(11,4,PD);p(12,4,PD);p(13,4,PU);p(14,4,PL);p(15,4,PD);
    p(9,5,PD);p(10,5,RD);p(11,5,WH);p(12,5,WH);p(13,5,RD);p(14,5,PD);

    // 몸통
    p(7,6,PD);p(8,6,PU);p(9,6,SC);p(10,6,PL);p(11,6,PF);p(12,6,PF);p(13,6,PL);p(14,6,SC);p(15,6,PU);p(16,6,PD);
    p(6,7,PD);p(7,7,PU);p(8,7,SC);p(9,7,PL);p(10,7,PF);p(11,7,GD);p(12,7,GD);p(13,7,PF);p(14,7,PL);p(15,7,SC);p(16,7,PU);p(17,7,PD);
    p(6,8,SD);p(7,8,PU);p(8,8,SC);p(9,8,PL);p(10,8,PF);p(11,8,PF);p(12,8,PF);p(13,8,PF);p(14,8,PL);p(15,8,SC);p(16,8,PU);p(17,8,SD);
    p(6,9,SD);p(7,9,SC);p(8,9,PU);p(9,9,PL);p(10,9,PL);p(11,9,PF);p(12,9,PF);p(13,9,PL);p(14,9,PL);p(15,9,PU);p(16,9,SC);p(17,9,SD);
    p(6,10,PD);p(7,10,SC);p(8,10,SC);p(9,10,PU);p(10,10,PL);p(11,10,PL);p(12,10,PL);p(13,10,PL);p(14,10,PU);p(15,10,SC);p(16,10,SC);p(17,10,PD);

    // 꼬리
    p(5,12,PD);p(6,12,SC);p(7,12,PU);p(7,13,SC);p(6,13,PD);p(5,13,SC);
    p(4,13,PD);p(4,14,SC);p(5,14,PD);p(3,14,PD);p(3,15,PU);p(4,15,SC);

    // 앞발
    p(8,11,SD);p(9,11,PU);p(10,11,SC);p(11,11,PL);p(12,11,PL);p(13,11,SC);p(14,11,PU);p(15,11,SD);
    p(8,12,SD);p(9,12,SC);p(10,12,PU);p(11,12,PL);p(12,12,PL);p(13,12,PU);p(14,12,SC);p(15,12,SD);
    // 발톱
    p(9,13,GD);p(10,13,GD);p(11,13,GL);p(12,13,GL);p(13,13,GD);p(14,13,GD);
    p(8,14,GD);p(15,14,GD);

    // 오브 (가슴 발광)
    p(11,8,PF);p(12,8,PF);p(11,9,EY);p(12,9,EY);

    return monsterSVG(px, scale);
}

// ── 엘리트: 고블린 대장 (갑옷+도끼) ──
function makeGoblinBossSVG(scale) {
    scale = scale || 5;
    let px = [];
    function p(x,y,c){px.push([x,y,c]);}
    let GN='#2a5a1a', GL='#4d9a3a', GD='#0e3a08';
    let AR='#4a4a7a', ARL='#7070b0', ARD='#2a2a50';
    let SK='#d4a870', EY='#ff4400', GLD='#d4a820', GLDB='#f0cc50';
    let AX='#a0a0c0', AXL='#d0d0e0';
    // 투구
    p(9,1,ARD);p(10,1,AR);p(11,1,ARL);p(12,1,ARL);p(13,1,AR);p(14,1,ARD);
    p(8,2,ARD);p(9,2,AR);p(10,2,ARL);p(11,2,ARL);p(12,2,ARL);p(13,2,ARL);p(14,2,AR);p(15,2,ARD);
    p(8,3,AR);p(9,3,GLD);p(10,3,AR);p(11,3,AR);p(12,3,AR);p(13,3,AR);p(14,3,GLD);p(15,3,AR);
    p(8,4,ARD);p(9,4,GN);p(10,4,SK);p(11,4,SK);p(12,4,SK);p(13,4,SK);p(14,4,GN);p(15,4,ARD);
    p(8,5,ARD);p(9,5,GN);p(10,5,EY);p(11,5,SK);p(12,5,SK);p(13,5,EY);p(14,5,GN);p(15,5,ARD);
    p(8,6,ARD);p(9,6,GN);p(10,6,SK);p(11,6,SK);p(12,6,SK);p(13,6,SK);p(14,6,GN);p(15,6,ARD);
    p(9,7,GD);p(10,7,SK);p(11,7,'#8a3010');p(12,7,SK);p(13,7,GD);
    // 어깨 갑옷
    p(5,8,ARD);p(6,8,AR);p(7,8,ARL);p(7,9,ARL);p(6,9,AR);p(5,9,ARD);p(5,10,GLD);p(6,10,GLD);
    p(17,8,ARD);p(18,8,AR);p(17,9,ARL);p(18,9,AR);p(19,9,ARD);p(17,10,GLD);p(18,10,GLD);
    // 몸통 갑옷
    p(8,8,AR);p(9,8,ARL);p(10,8,AR);p(11,8,GLD);p(12,8,GLD);p(13,8,AR);p(14,8,ARL);p(15,8,AR);
    p(8,9,ARD);p(9,9,AR);p(10,9,ARL);p(11,9,AR);p(12,9,AR);p(13,9,ARL);p(14,9,AR);p(15,9,ARD);
    p(8,10,ARD);p(9,10,ARL);p(10,10,ARL);p(11,10,GLD);p(12,10,GLD);p(13,10,ARL);p(14,10,ARL);p(15,10,ARD);
    p(8,11,ARD);p(9,11,AR);p(10,11,ARL);p(11,11,AR);p(12,11,AR);p(13,11,ARL);p(14,11,AR);p(15,11,ARD);
    // 도끼 (오른쪽)
    p(16,6,AX);p(17,6,AXL);p(18,6,AXL);p(17,7,AXL);p(18,7,AX);p(19,7,AXL);
    p(16,7,GLD);p(16,8,GLD);p(16,9,AX);p(16,10,AX);p(16,11,GLD);p(16,12,AX);
    // 방패 (왼쪽)
    p(4,9,GLD);p(3,9,GLD);p(3,10,AR);p(4,10,ARL);p(5,10,AR);p(3,11,GLD);p(4,11,EY);p(5,11,GLD);p(3,12,AR);p(4,12,ARL);
    // 다리
    p(9,12,ARD);p(10,12,AR);p(11,12,GN);p(12,12,GN);p(13,12,AR);p(14,12,ARD);
    p(9,13,AR);p(10,13,GN);p(11,13,GL);p(12,13,GL);p(13,13,GN);p(14,13,AR);
    p(9,14,GD);p(10,14,GN);p(11,14,GD);p(12,14,GD);p(13,14,GN);p(14,14,GD);
    p(9,15,ARD);p(10,15,AR);p(12,15,AR);p(13,15,ARD);
    return monsterSVG(px, scale);
}

// ── 보스: 언데드 군주 (거대 리치 왕) ──
function makeUndeadLordSVG(scale) {
    scale = scale || 5;
    let px = [];
    function p(x,y,c){px.push([x,y,c]);}
    let BN='#d4c8a0', BND='#8a8060', BNL='#fffff0';
    let CR='#6a0080', CRL='#aa40c0', CRD='#3a0050';
    let EY='#00ffff', PU='#cc00ff', GD='#d4a820', GL='#f0cc50';
    let RD='#cc0000', BL='#000020';
    // 왕관
    p(8,0,GD);p(10,0,GD);p(12,0,GD);p(14,0,GD);p(16,0,GD);
    p(8,1,GL);p(9,1,GD);p(10,1,GL);p(11,1,GD);p(12,1,GL);p(13,1,GD);p(14,1,GL);p(15,1,GD);p(16,1,GL);
    p(7,2,GD);p(8,2,GL);p(9,2,GL);p(10,2,GD);p(11,2,GD);p(12,2,GD);p(13,2,GD);p(14,2,GL);p(15,2,GL);p(16,2,GD);
    // 보석
    p(9,1,EY);p(12,1,PU);p(15,1,EY);
    // 해골 얼굴 (크게)
    p(7,3,BND);p(8,3,BN);p(9,3,BN);p(10,3,BN);p(11,3,BN);p(12,3,BN);p(13,3,BN);p(14,3,BN);p(15,3,BN);p(16,3,BND);
    p(7,4,BN);p(8,4,BNL);p(9,4,BN);p(10,4,EY);p(11,4,EY);p(12,4,BN);p(13,4,EY);p(14,4,EY);p(15,4,BNL);p(16,4,BN);
    p(7,5,BN);p(8,5,BN);p(9,5,BND);p(10,5,EY);p(11,5,PU);p(12,5,BND);p(13,5,PU);p(14,5,EY);p(15,5,BN);p(16,5,BN);
    p(7,6,BND);p(8,6,BN);p(9,6,BN);p(10,6,BN);p(11,6,BN);p(12,6,BN);p(13,6,BN);p(14,6,BN);p(15,6,BN);p(16,6,BND);
    p(8,7,BND);p(9,7,BN);p(10,7,BND);p(11,7,RD);p(12,7,RD);p(13,7,BND);p(14,7,BN);p(15,7,BND);
    p(9,8,BND);p(10,8,BN);p(11,8,BND);p(12,8,BND);p(13,8,BN);p(14,8,BND);
    // 로브
    p(5,9,CRD);p(6,9,CR);p(7,9,CRL);p(8,9,BN);p(9,9,CR);p(10,9,GD);p(11,9,GD);p(12,9,GD);p(13,9,CR);p(14,9,BN);p(15,9,CRL);p(16,9,CR);p(17,9,CRD);
    p(4,10,CRD);p(5,10,CR);p(6,10,CRL);p(7,10,CRL);p(8,10,CR);p(9,10,CRD);p(10,10,EY);p(11,10,PU);p(12,10,PU);p(13,10,EY);p(14,10,CRD);p(15,10,CR);p(16,10,CRL);p(17,10,CRL);p(18,10,CR);p(19,10,CRD);
    p(4,11,CRD);p(5,11,CR);p(6,11,CRL);p(7,11,CRL);p(8,11,CRL);p(9,11,CR);p(10,11,CR);p(11,11,GD);p(12,11,GD);p(13,11,CR);p(14,11,CR);p(15,11,CRL);p(16,11,CRL);p(17,11,CRL);p(18,11,CR);p(19,11,CRD);
    // 지팡이 (왼)
    p(3,6,GD);p(4,7,GL);p(3,7,EY);p(4,8,GD);p(4,9,BND);p(4,10,BN);p(3,11,BN);p(3,12,BND);p(3,13,BN);p(3,14,BND);
    // 오브 (오른)
    p(19,7,PU);p(20,7,EY);p(21,7,PU);p(19,8,EY);p(20,8,PU);p(21,8,EY);p(19,9,PU);p(20,9,EY);p(21,9,PU);
    // 하의
    p(5,12,CRD);p(6,12,CR);p(7,12,CRL);p(8,12,CR);p(9,12,CR);p(10,12,CRL);p(11,12,CRL);p(12,12,CRL);p(13,12,CRL);p(14,12,CR);p(15,12,CR);p(16,12,CRL);p(17,12,CR);p(18,12,CRD);
    p(6,13,CRD);p(7,13,CR);p(8,13,CRL);p(9,13,CRL);p(10,13,CR);p(11,13,CR);p(12,13,CR);p(13,13,CR);p(14,13,CRL);p(15,13,CRL);p(16,13,CR);p(17,13,CRD);
    return monsterSVG(px, scale);
}

// 몬스터 SVG 맵
let MONSTER_SVG_MAP = {
    'goblin':       makeGoblinSVG,       // 1막 일반
    'goblin_boss':  makeGoblinBossSVG,   // 1막 엘리트 (군장)
    'lich':         makeLichSVG,         // 2막 리치 수련생
    'undead_lord':  makeUndeadLordSVG,   // 2막 엘리트 (재판관)
    'dragon':       makeDragonSVG,       // (fallback)
};
// 명시적 재등록 (모든 키 보장)
MONSTER_SVG_MAP['goblin']      = makeGoblinSVG;
MONSTER_SVG_MAP['goblin_boss'] = makeGoblinBossSVG;
MONSTER_SVG_MAP['lich']        = makeLichSVG;
MONSTER_SVG_MAP['undead_lord'] = makeUndeadLordSVG;
MONSTER_SVG_MAP['dragon']      = makeDragonSVG;

function getMonsterSVG(key, scale) {
    let fn = MONSTER_SVG_MAP[key];
    return fn ? fn(scale || 5) : null;
}

// ══════════════════════════════════════════════
// 추가 몬스터 SVG — 막별 전체 세트
// ══════════════════════════════════════════════

// 1막 ─────────────────────────
// 고블린 도적 (날렵, 단검)
function makeGoblinRogueSVG(scale) {
    scale=scale||5; let px=[]; function p(x,y,c){px.push([x,y,c]);}
    let G='#3a7a2a',GL='#5db84a',GD='#1e4d14';
    let SK='#d4a870',EY='#ff2200',WH='#fff';
    let BL='#1a1a3a',BLL='#3a3a6a'; // 검은 복장
    let SL='#c0c0d0',SLD='#808090'; // 단검
    // 두건
    p(8,2,BL);p(9,2,BLL);p(10,2,BLL);p(11,2,BLL);p(12,2,BLL);p(13,2,BLL);p(14,2,BLL);p(15,2,BL);
    p(7,3,BL);p(8,3,BLL);p(9,3,SK);p(10,3,SK);p(11,3,SK);p(12,3,SK);p(13,3,SK);p(14,3,BLL);p(15,3,BLL);p(16,3,BL);
    p(7,4,BL);p(8,4,BLL);p(9,4,EY);p(10,4,WH);p(11,4,SK);p(12,4,WH);p(13,4,EY);p(14,4,SK);p(15,4,BLL);p(16,4,BL);
    p(7,5,BL);p(8,5,BLL);p(9,5,SK);p(10,5,SK);p(11,5,SK);p(12,5,SK);p(13,5,SK);p(14,5,BLL);p(15,5,BL);
    p(8,6,G);p(9,6,SK);p(10,6,'#8a3010');p(11,6,SK);p(12,6,SK);p(13,6,G);
    p(9,7,GD);p(10,7,G);p(11,7,G);p(12,7,GD);
    // 날렵한 몸
    p(8,8,BL);p(9,8,BLL);p(10,8,BLL);p(11,8,BL);p(12,8,BLL);p(13,8,BLL);p(14,8,BL);
    p(7,9,GD);p(8,9,BLL);p(9,9,BLL);p(10,9,BL);p(11,9,BL);p(12,9,BLL);p(13,9,BLL);p(14,9,GD);
    p(7,10,BL);p(8,10,G);p(9,10,BLL);p(10,10,BLL);p(11,10,BLL);p(12,10,BLL);p(13,10,G);p(14,10,BL);
    p(7,11,BL);p(8,11,BLL);p(9,11,BLL);p(10,11,BL);p(11,11,BL);p(12,11,BLL);p(13,11,BLL);p(14,11,BL);
    p(8,12,BL);p(9,12,G);p(10,12,BLL);p(11,12,BLL);p(12,12,G);p(13,12,BL);
    // 단검 두 개
    p(3,8,SLD);p(4,8,SL);p(5,8,SL);p(5,9,SL);p(4,9,SLD);
    p(19,7,SLD);p(18,8,SL);p(17,8,SL);p(17,9,SLD);p(18,9,SL);
    // 다리
    p(9,13,GD);p(10,13,G);p(11,13,G);p(12,13,GD);
    p(9,14,BL);p(10,14,BLL);p(11,14,BLL);p(12,14,BL);
    p(9,15,GD);p(10,15,G);p(11,15,G);p(12,15,GD);
    return monsterSVG(px,scale);
}

// 고블린 궁수
function makeGoblinArcherSVG(scale) {
    scale=scale||5; let px=[]; function p(x,y,c){px.push([x,y,c]);}
    let G='#3a7a2a',GL='#5db84a',GD='#1e4d14';
    let SK='#d4a870',EY='#ff2200',BR='#7a4010',BRL='#b06020';
    let BW='#8b6010',BWL='#c08820',AR='#c8c8c8';
    // 머리 (녹색 모자)
    p(9,1,G);p(10,1,GL);p(11,1,GL);p(12,1,G);p(8,2,GD);p(13,2,GD);
    p(8,3,G);p(9,3,GL);p(10,3,SK);p(11,3,SK);p(12,3,GL);p(13,3,G);
    p(8,4,G);p(9,4,EY);p(10,4,SK);p(11,4,SK);p(12,4,EY);p(13,4,G);
    let WH=SK;
    p(9,5,G);p(10,5,SK);p(11,5,SK);p(12,5,G);
    p(10,6,G);p(11,6,'#8a3010');p(12,6,G);
    p(10,7,GD);p(11,7,G);
    // 몸
    p(8,8,GD);p(9,8,G);p(10,8,BR);p(11,8,BRL);p(12,8,BR);p(13,8,GD);
    p(7,9,G);p(8,9,GL);p(9,9,BR);p(10,9,BRL);p(11,9,BRL);p(12,9,BR);p(13,9,GL);p(14,9,G);
    p(7,10,G);p(8,10,GL);p(9,10,BRL);p(10,10,BR);p(11,10,BR);p(12,10,BRL);p(13,10,GL);p(14,10,G);
    p(8,11,G);p(9,11,GL);p(10,11,G);p(11,11,G);p(12,11,GL);p(13,11,G);
    // 활
    p(2,5,BWL);p(3,6,BW);p(3,7,BW);p(2,8,BWL);p(3,8,BW);p(3,9,BW);p(2,10,BWL);p(3,11,BW);p(2,11,BW);
    p(2,6,'#d4c080');p(2,7,'#d4c080');p(2,9,'#d4c080');p(2,10,'#d4c080');
    // 화살
    p(4,8,AR);p(5,8,AR);p(6,8,AR);p(7,8,AR);
    // 다리
    p(9,12,GD);p(10,12,G);p(11,12,G);p(12,12,GD);
    p(9,13,GD);p(10,13,GL);p(11,13,GL);p(12,13,GD);
    p(9,14,BR);p(10,14,BRL);p(11,14,BRL);p(12,14,BR);
    p(9,15,BR);p(10,15,BR);p(11,15,BR);p(12,15,BR);
    return monsterSVG(px,scale);
}

// 고블린 주술사
function makeGoblinShamanSVG(scale) {
    scale=scale||5; let px=[]; function p(x,y,c){px.push([x,y,c]);}
    let G='#3a7a2a',GL='#5db84a',GD='#1e4d14';
    let SK='#d4a870',EY='#00ff88';
    let PU='#8b2fc9',PL='#c39bea',PD='#4a148c';
    let ST='#8b6010',STL='#c08820';
    let BN='#e0d090';
    // 뿔 달린 해골 머리장식
    p(9,0,BN);p(10,0,BN);p(11,0,BN);p(12,0,BN);p(13,0,BN);
    p(8,1,BN);p(14,1,BN);p(7,0,BN);p(15,0,BN);
    // 얼굴
    p(8,2,PD);p(9,2,PU);p(10,2,G);p(11,2,GL);p(12,2,G);p(13,2,PU);p(14,2,PD);
    p(8,3,PU);p(9,3,G);p(10,3,SK);p(11,3,SK);p(12,3,SK);p(13,3,G);p(14,3,PU);
    p(8,4,PU);p(9,4,G);p(10,4,EY);p(11,4,SK);p(12,4,EY);p(13,4,G);p(14,4,PU);
    p(9,5,G);p(10,5,SK);p(11,5,SK);p(12,5,SK);p(13,5,G);
    p(10,6,G);p(11,6,'#cc4400');p(12,6,G);
    // 로브
    p(7,7,PD);p(8,7,PU);p(9,7,PL);p(10,7,PU);p(11,7,PU);p(12,7,PL);p(13,7,PU);p(14,7,PD);
    p(6,8,PD);p(7,8,PU);p(8,8,PL);p(9,8,PU);p(10,8,PU);p(11,8,PU);p(12,8,PU);p(13,8,PL);p(14,8,PU);p(15,8,PD);
    p(6,9,PD);p(7,9,PL);p(8,9,PU);p(9,9,PL);p(10,9,EY);p(11,9,EY);p(12,9,PL);p(13,9,PU);p(14,9,PL);p(15,9,PD);
    p(6,10,PD);p(7,10,PU);p(8,10,PL);p(9,10,PU);p(10,10,PU);p(11,10,PU);p(12,10,PU);p(13,10,PL);p(14,10,PU);p(15,10,PD);
    p(7,11,PD);p(8,11,PU);p(9,11,PL);p(10,11,PU);p(11,11,PU);p(12,11,PL);p(13,11,PU);p(14,11,PD);
    // 지팡이
    p(17,3,EY);p(18,4,PU);p(17,4,PL);p(17,5,ST);p(17,6,ST);p(17,7,STL);p(17,8,ST);p(17,9,ST);p(17,10,STL);
    // 하의
    p(8,12,PD);p(9,12,PU);p(10,12,PL);p(11,12,PL);p(12,12,PU);p(13,12,PD);
    p(9,13,GD);p(10,13,G);p(11,13,G);p(12,13,GD);
    p(9,14,GD);p(10,14,GL);p(11,14,GL);p(12,14,GD);
    return monsterSVG(px,scale);
}

// 2막 ─────────────────────────
// 유령
function makeGhostSVG(scale) {
    scale=scale||5; let px=[]; function p(x,y,c){px.push([x,y,c]);}
    let W='#d0d8f8',WL='#eef0ff',WD='#8090c0',WX='rgba(200,210,255,0.5)';
    let EY='#cc00ff',BL='#000';
    // 반투명 몸체
    p(9,2,WD);p(10,2,W);p(11,2,W);p(12,2,W);p(13,2,WD);
    p(8,3,WD);p(9,3,WL);p(10,3,WL);p(11,3,WL);p(12,3,WL);p(13,3,WL);p(14,3,WD);
    p(7,4,WD);p(8,4,WL);p(9,4,W);p(10,4,EY);p(11,4,W);p(12,4,EY);p(13,4,W);p(14,4,WL);p(15,4,WD);
    p(7,5,WD);p(8,5,WL);p(9,5,W);p(10,5,W);p(11,5,BL);p(12,5,W);p(13,5,W);p(14,5,WL);p(15,5,WD);
    p(7,6,WD);p(8,6,WL);p(9,6,W);p(10,6,W);p(11,6,W);p(12,6,W);p(13,6,W);p(14,6,WL);p(15,6,WD);
    p(7,7,WD);p(8,7,WL);p(9,7,W);p(10,7,EY);p(11,7,W);p(12,7,EY);p(13,7,W);p(14,7,WL);p(15,7,WD);
    p(7,8,WD);p(8,8,WL);p(9,8,WL);p(10,8,W);p(11,8,W);p(12,8,W);p(13,8,WL);p(14,8,WL);p(15,8,WD);
    p(7,9,WD);p(8,9,W);p(9,9,WL);p(10,9,WL);p(11,9,W);p(12,9,WL);p(13,9,WL);p(14,9,W);p(15,9,WD);
    p(7,10,WD);p(8,10,WL);p(9,10,W);p(10,10,WL);p(11,10,WL);p(12,10,WL);p(13,10,W);p(14,10,WL);p(15,10,WD);
    // 물결 하단
    p(7,11,WD);p(8,11,W);p(10,11,W);p(12,11,W);p(14,11,W);p(15,11,WD);
    p(8,12,WD);p(9,12,W);p(11,12,W);p(13,12,W);p(14,12,WD);
    // 팔 (반투명)
    p(5,7,WD);p(6,7,W);p(6,8,WD);p(5,8,W);p(5,9,WD);
    p(17,7,WD);p(18,7,W);p(18,8,WD);p(17,8,W);p(17,9,WD);
    return monsterSVG(px,scale);
}

// 해골 전사
function makeSkeletonSVG(scale) {
    scale=scale||5; let px=[]; function p(x,y,c){px.push([x,y,c]);}
    let BN='#d8cfa0',BND='#9a9070',BNL='#fffff0';
    let EY='#00eeff',RD='#cc3300';
    let AR='#5a5a7a',ARL='#8a8ab0',ARD='#2a2a40';
    let SW='#c0c8d0',SWL='#e8eef4';
    // 해골 머리
    p(9,2,BND);p(10,2,BN);p(11,2,BNL);p(12,2,BNL);p(13,2,BN);p(14,2,BND);
    p(8,3,BND);p(9,3,BN);p(10,3,BNL);p(11,3,BNL);p(12,3,BNL);p(13,3,BNL);p(14,3,BN);p(15,3,BND);
    p(8,4,BN);p(9,4,BNL);p(10,4,EY);p(11,4,BNL);p(12,4,BNL);p(13,4,EY);p(14,4,BNL);p(15,4,BN);
    p(8,5,BN);p(9,5,BN);p(10,5,BND);p(11,5,BN);p(12,5,BN);p(13,5,BND);p(14,5,BN);p(15,5,BN);
    p(9,6,BND);p(10,6,BN);p(11,6,RD);p(12,6,RD);p(13,6,BN);p(14,6,BND);
    p(10,7,BND);p(11,7,BN);p(12,7,BN);p(13,7,BND);
    // 갑옷 몸
    p(8,8,ARD);p(9,8,AR);p(10,8,ARL);p(11,8,ARL);p(12,8,ARL);p(13,8,ARL);p(14,8,AR);p(15,8,ARD);
    p(8,9,ARD);p(9,9,ARL);p(10,9,AR);p(11,9,BN);p(12,9,BN);p(13,9,AR);p(14,9,ARL);p(15,9,ARD);
    p(8,10,AR);p(9,10,BN);p(10,10,AR);p(11,10,ARL);p(12,10,ARL);p(13,10,AR);p(14,10,BN);p(15,10,AR);
    p(8,11,ARD);p(9,11,AR);p(10,11,ARL);p(11,11,AR);p(12,11,AR);p(13,11,ARL);p(14,11,AR);p(15,11,ARD);
    // 검
    p(17,5,SWL);p(18,6,SW);p(17,6,SWL);p(17,7,SW);p(16,8,SW);p(16,9,SWL);p(16,10,SW);
    p(15,8,'#d4a820');p(16,8,'#d4a820');
    // 다리 (뼈)
    p(9,12,ARD);p(10,12,BN);p(11,12,BN);p(12,12,AR);p(13,12,ARD);
    p(9,13,BN);p(10,13,BND);p(12,13,BND);p(13,13,BN);
    p(9,14,BN);p(10,14,BN);p(12,14,BN);p(13,14,BN);
    p(9,15,BND);p(10,15,BN);p(12,15,BN);p(13,15,BND);
    return monsterSVG(px,scale);
}

// 좀비
function makeZombieSVG(scale) {
    scale=scale||5; let px=[]; function p(x,y,c){px.push([x,y,c]);}
    let SK='#8aaa6a',SKD='#4a7a3a',SKL='#aaca8a'; // 좀비 피부 (녹색)
    let EY='#ffcc00',BL='#330000';
    let CL='#4a3a2a',CLD='#2a1a0a',CLL='#6a5a3a'; // 낡은 옷
    let RD='#cc0000';
    // 머리
    p(9,2,SKD);p(10,2,SK);p(11,2,SKL);p(12,2,SKL);p(13,2,SK);p(14,2,SKD);
    p(8,3,SKD);p(9,3,SK);p(10,3,SKL);p(11,3,SKL);p(12,3,SKL);p(13,3,SKL);p(14,3,SK);p(15,3,SKD);
    p(8,4,SK);p(9,4,SKL);p(10,4,EY);p(11,4,SKL);p(12,4,SKL);p(13,4,EY);p(14,4,SKL);p(15,4,SK);
    p(8,5,SK);p(9,5,SK);p(10,5,SKD);p(11,5,SK);p(12,5,SK);p(13,5,SKD);p(14,5,SK);p(15,5,SK);
    p(9,6,SKD);p(10,6,SK);p(11,6,RD);p(12,6,RD);p(13,6,SK);p(14,6,SKD);
    // 낡은 몸
    p(7,7,CLD);p(8,7,CL);p(9,7,CLL);p(10,7,CL);p(11,7,CL);p(12,7,CLL);p(13,7,CL);p(14,7,CLD);
    p(7,8,CLD);p(8,8,CLL);p(9,8,SK);p(10,8,CL);p(11,8,CL);p(12,8,SK);p(13,8,CLL);p(14,8,CLD);
    p(7,9,CL);p(8,9,CLL);p(9,9,CL);p(10,9,CLL);p(11,9,CLL);p(12,9,CL);p(13,9,CLL);p(14,9,CL);
    p(7,10,CLD);p(8,10,CL);p(9,10,SK);p(10,10,CL);p(11,10,CL);p(12,10,SK);p(13,10,CL);p(14,10,CLD);
    p(8,11,CL);p(9,11,CLL);p(10,11,CL);p(11,11,CL);p(12,11,CLL);p(13,11,CL);
    // 팔 (내밀기)
    p(5,9,SK);p(4,9,SKL);p(4,10,SK);p(3,10,SKD);
    p(5,8,SK);p(6,8,SKD);
    p(18,9,SK);p(19,9,SKL);p(19,10,SK);p(20,10,SKD);
    // 다리
    p(9,12,CLD);p(10,12,CL);p(11,12,CL);p(12,12,CLD);
    p(9,13,SK);p(10,13,SKD);p(11,13,SKD);p(12,13,SK);
    p(9,14,SKD);p(10,14,SK);p(11,14,SK);p(12,14,SKD);
    p(8,15,SKD);p(9,15,SK);p(11,15,SK);p(12,15,SKD);p(13,15,SKD);
    return monsterSVG(px,scale);
}

// 저주받은 기사 (2막)
function makeCursedKnightSVG(scale) {
    scale=scale||5; let px=[]; function p(x,y,c){px.push([x,y,c]);}
    let AR='#2a2a40',ARL='#4a4a70',ARD='#0a0a20';
    let PU='#6600aa',PL='#aa44ee',EY='#ff00ff';
    let SW='#808090',SWL='#c0c0d0';
    let GD='#d4a820';
    // 저주받은 투구
    p(9,1,ARD);p(10,1,AR);p(11,1,PU);p(12,1,PU);p(13,1,AR);p(14,1,ARD);
    p(8,2,ARD);p(9,2,AR);p(10,2,ARL);p(11,2,ARL);p(12,2,ARL);p(13,2,ARL);p(14,2,AR);p(15,2,ARD);
    p(8,3,AR);p(9,3,ARL);p(10,3,PL);p(11,3,PU);p(12,3,PU);p(13,3,PL);p(14,3,ARL);p(15,3,AR);
    p(8,4,ARD);p(9,4,AR);p(10,4,EY);p(11,4,PU);p(12,4,PU);p(13,4,EY);p(14,4,AR);p(15,4,ARD);
    p(9,5,ARD);p(10,5,AR);p(11,5,ARL);p(12,5,ARL);p(13,5,AR);p(14,5,ARD);
    p(10,6,ARD);p(11,6,AR);p(12,6,AR);p(13,6,ARD);
    // 갑옷 몸
    p(7,7,ARD);p(8,7,AR);p(9,7,ARL);p(10,7,GD);p(11,7,GD);p(12,7,GD);p(13,7,ARL);p(14,7,AR);p(15,7,ARD);
    p(6,8,ARD);p(7,8,PU);p(8,8,ARL);p(9,8,AR);p(10,8,AR);p(11,8,ARL);p(12,8,ARL);p(13,8,AR);p(14,8,ARL);p(15,8,PU);p(16,8,ARD);
    p(6,9,AR);p(7,9,ARL);p(8,9,AR);p(9,9,ARL);p(10,9,PU);p(11,9,PL);p(12,9,PU);p(13,9,ARL);p(14,9,AR);p(15,9,ARL);p(16,9,AR);
    p(7,10,ARD);p(8,10,AR);p(9,10,ARL);p(10,10,AR);p(11,10,AR);p(12,10,AR);p(13,10,ARL);p(14,10,AR);p(15,10,ARD);
    p(8,11,AR);p(9,11,ARL);p(10,11,GD);p(11,11,GD);p(12,11,GD);p(13,11,ARL);p(14,11,AR);
    // 대검
    p(17,3,SWL);p(18,4,SW);p(17,4,SWL);p(17,5,SW);p(16,6,SW);p(16,7,SWL);p(15,8,GD);p(16,8,GD);p(16,9,SW);
    // 다리
    p(9,12,ARD);p(10,12,AR);p(11,12,AR);p(12,12,AR);p(13,12,ARD);
    p(9,13,AR);p(10,13,ARL);p(11,13,PU);p(12,13,ARL);p(13,13,AR);
    p(9,14,ARD);p(10,14,AR);p(12,14,AR);p(13,14,ARD);
    p(9,15,AR);p(10,15,ARL);p(12,15,ARL);p(13,15,AR);
    return monsterSVG(px,scale);
}

// 3막 ─────────────────────────
// 화염 임프 (작고 빠른)
function makeFireImpSVG(scale) {
    scale=scale||5; let px=[]; function p(x,y,c){px.push([x,y,c]);}
    let RD='#cc2200',RL='#ff5500',RLD='#881100',OR='#ff8800',YL='#ffcc00';
    let EY='#ffffff',BK='#000000';
    let HN='#8b1a1a'; // 뿔
    // 뿔
    p(9,0,HN);p(10,1,HN);p(13,0,HN);p(14,1,HN);
    // 날개
    p(3,4,RLD);p(4,4,RD);p(4,5,RL);p(3,5,RLD);p(3,6,RD);p(4,6,RD);p(2,5,RLD);
    p(19,4,RLD);p(18,4,RD);p(18,5,RL);p(19,5,RLD);p(20,5,RD);p(18,6,RD);p(19,6,RLD);
    // 머리
    p(9,2,RLD);p(10,2,RD);p(11,2,RL);p(12,2,RL);p(13,2,RD);p(14,2,RLD);
    p(8,3,RD);p(9,3,RL);p(10,3,OR);p(11,3,OR);p(12,3,OR);p(13,3,RL);p(14,3,RLD);
    p(8,4,RD);p(9,4,RL);p(10,4,EY);p(11,4,OR);p(12,4,EY);p(13,4,RL);p(14,4,RD);
    p(9,5,RLD);p(10,5,OR);p(11,5,OR);p(12,5,OR);p(13,5,RLD);
    p(10,6,RD);p(11,6,BK);p(12,6,RD);
    // 몸
    p(8,7,RLD);p(9,7,RD);p(10,7,RL);p(11,7,OR);p(12,7,RL);p(13,7,RD);p(14,7,RLD);
    p(8,8,RD);p(9,8,RL);p(10,8,OR);p(11,8,YL);p(12,8,OR);p(13,8,RL);p(14,8,RD);
    p(9,9,RLD);p(10,9,RD);p(11,9,RL);p(12,9,RD);p(13,9,RLD);
    p(10,10,RLD);p(11,10,RD);p(12,10,RLD);
    // 꼬리
    p(10,11,RD);p(11,11,RL);p(12,11,RLD);p(13,12,RD);p(14,13,RLD);p(14,14,YL);
    // 발
    p(9,11,RLD);p(10,11,RD);p(12,11,RD);p(13,11,RLD);
    p(8,12,RLD);p(9,12,OR);p(12,12,OR);p(13,12,RLD);
    p(8,13,YL);p(9,13,OR);p(12,13,OR);p(13,13,YL);
    return monsterSVG(px,scale);
}

// 용암 골렘
function makeLavaGolemSVG(scale) {
    scale=scale||5; let px=[]; function p(x,y,c){px.push([x,y,c]);}
    let RK='#3a2a1a',RKL='#6a4a2a',RKD='#1a0a00';
    let LV='#ff5500',LVL='#ff8800',LVD='#cc3300',YL='#ffcc00';
    let EY='#ffff00';
    // 몸통 (바위)
    p(7,3,RKD);p(8,3,RK);p(9,3,RKL);p(10,3,RK);p(11,3,RK);p(12,3,RKL);p(13,3,RK);p(14,3,RKD);
    p(6,4,RKD);p(7,4,RK);p(8,4,RKL);p(9,4,RK);p(10,4,LV);p(11,4,LV);p(12,4,RKL);p(13,4,RK);p(14,4,RKL);p(15,4,RKD);
    p(6,5,RK);p(7,5,RKL);p(8,5,RK);p(9,5,LV);p(10,5,LVL);p(11,5,LVL);p(12,5,LV);p(13,5,RKL);p(14,5,RK);p(15,5,RKD);
    p(5,6,RKD);p(6,6,RK);p(7,6,RKL);p(8,6,EY);p(9,6,EY);p(10,6,LVL);p(11,6,LVL);p(12,6,EY);p(13,6,EY);p(14,6,RKL);p(15,6,RK);p(16,6,RKD);
    p(5,7,RK);p(6,7,RKL);p(7,7,RK);p(8,7,RKL);p(9,7,LV);p(10,7,YL);p(11,7,YL);p(12,7,LV);p(13,7,RKL);p(14,7,RK);p(15,7,RKL);p(16,7,RKD);
    p(5,8,RKD);p(6,8,RK);p(7,8,LV);p(8,8,LVL);p(9,8,LV);p(10,8,LVD);p(11,8,LVD);p(12,8,LV);p(13,8,LVL);p(14,8,LV);p(15,8,RK);p(16,8,RKD);
    p(6,9,RKD);p(7,9,RK);p(8,9,RKL);p(9,9,LVD);p(10,9,LV);p(11,9,LV);p(12,9,LVD);p(13,9,RKL);p(14,9,RK);p(15,9,RKD);
    p(7,10,RKD);p(8,10,RK);p(9,10,RKL);p(10,10,RK);p(11,10,RK);p(12,10,RKL);p(13,10,RK);p(14,10,RKD);
    // 팔 (바위)
    p(3,6,RKD);p(4,6,RK);p(4,7,RKL);p(3,7,RKD);p(3,8,LV);p(4,8,LVL);p(3,9,RKD);p(4,9,RK);
    p(18,6,RKD);p(19,6,RK);p(19,7,RKL);p(20,7,RKD);p(19,8,LVL);p(20,8,LV);p(19,9,RK);p(20,9,RKD);
    // 다리
    p(8,11,RKD);p(9,11,RK);p(10,11,LV);p(11,11,LV);p(12,11,RK);p(13,11,RKD);
    p(8,12,RK);p(9,12,RKL);p(10,12,RK);p(11,12,RK);p(12,12,RKL);p(13,12,RK);
    p(8,13,RKD);p(9,13,RK);p(11,13,RK);p(12,13,RKD);
    p(7,14,RKD);p(8,14,RK);p(9,14,RKL);p(11,14,RKL);p(12,14,RK);p(13,14,RKD);
    return monsterSVG(px,scale);
}

// 지옥 박쥐
function makeHellBatSVG(scale) {
    scale=scale||5; let px=[]; function p(x,y,c){px.push([x,y,c]);}
    let BK='#1a0a20',BKL='#3a1a40',PU='#6600aa',PL='#aa44ee',EY='#ff0000';
    let MG='#ff00ff',WH='#ffffff';
    // 날개 (넓게)
    p(0,5,BK);p(1,5,BKL);p(2,5,PU);p(3,5,PL);p(4,5,PU);p(1,6,BK);p(2,6,PU);p(3,6,PL);p(4,6,PU);p(5,6,PL);
    p(1,7,BKL);p(2,7,PU);p(3,7,PL);p(4,7,PU);p(5,7,PL);p(6,7,PU);
    p(2,8,BK);p(3,8,PU);p(4,8,PL);p(5,8,PU);p(6,8,PL);p(7,8,PU);
    p(22,5,BK);p(21,5,BKL);p(20,5,PU);p(19,5,PL);p(18,5,PU);p(21,6,BK);p(20,6,PU);p(19,6,PL);p(18,6,PU);p(17,6,PL);
    p(21,7,BKL);p(20,7,PU);p(19,7,PL);p(18,7,PU);p(17,7,PL);p(16,7,PU);
    p(20,8,BK);p(19,8,PU);p(18,8,PL);p(17,8,PU);p(16,8,PL);p(15,8,PU);
    // 몸통
    p(8,5,BK);p(9,5,BKL);p(10,5,PU);p(11,5,PL);p(12,5,PL);p(13,5,PU);p(14,5,BKL);p(15,5,BK);
    p(8,6,BKL);p(9,6,PU);p(10,6,EY);p(11,6,PL);p(12,6,PL);p(13,6,EY);p(14,6,PU);p(15,6,BKL);
    p(9,7,BKL);p(10,7,PU);p(11,7,BK);p(12,7,BK);p(13,7,PU);p(14,7,BKL);
    p(9,8,BK);p(10,8,PU);p(11,8,PL);p(12,8,PL);p(13,8,PU);p(14,8,BK);
    p(10,9,BKL);p(11,9,MG);p(12,9,MG);p(13,9,BKL);
    // 발톱
    p(9,10,BK);p(10,10,BKL);p(13,10,BKL);p(14,10,BK);
    p(9,11,PU);p(10,11,PU);p(13,11,PU);p(14,11,PU);
    return monsterSVG(px,scale);
}

// ── 업데이트: MONSTER_SVG_MAP에 추가 ──
MONSTER_SVG_MAP['goblin_rogue']    = makeGoblinRogueSVG;
MONSTER_SVG_MAP['goblin_archer']   = makeGoblinArcherSVG;
MONSTER_SVG_MAP['goblin_shaman']   = makeGoblinShamanSVG;
MONSTER_SVG_MAP['ghost']           = makeGhostSVG;
MONSTER_SVG_MAP['skeleton']        = makeSkeletonSVG;
MONSTER_SVG_MAP['zombie']          = makeZombieSVG;
MONSTER_SVG_MAP['cursed_knight']   = makeCursedKnightSVG;
MONSTER_SVG_MAP['fire_imp']        = makeFireImpSVG;
MONSTER_SVG_MAP['lava_golem']      = makeLavaGolemSVG;
MONSTER_SVG_MAP['hell_bat']        = makeHellBatSVG;

// ══════════════════════════════════════════════
// 3막 전용 신규 몬스터
// ══════════════════════════════════════════════

// 암흑 기사 (3막 전용 — 붉은 갑옷, 불꽃 검)
function makeDarkKnightSVG(scale) {
    scale=scale||5; let px=[]; function p(x,y,c){px.push([x,y,c]);}
    let AR='#1a0a0a',ARL='#4a1010',ARD='#0a0000';
    let RD='#cc1100',RDL='#ff3300',RDD='#880000';
    let EY='#ff6600',OR='#ff9900',YL='#ffdd00';
    let BL='#000000',SK='#c07050';
    let SW='#cc8800',SWL='#ffcc00',SWD='#885500';
    // 투구 — 붉은 뿔 장식
    p(10,0,RDD);p(11,0,RD);p(12,0,RD);p(13,0,RDD);
    p(9,1,ARD);p(10,1,AR);p(11,1,ARL);p(12,1,ARL);p(13,1,AR);p(14,1,ARD);
    p(8,2,ARD);p(9,2,ARL);p(10,2,AR);p(11,2,AR);p(12,2,AR);p(13,2,AR);p(14,2,ARL);p(15,2,ARD);
    p(8,3,AR);p(9,3,ARL);p(10,3,RD);p(11,3,AR);p(12,3,AR);p(13,3,RD);p(14,3,ARL);p(15,3,AR);
    p(8,4,ARD);p(9,4,AR);p(10,4,EY);p(11,4,OR);p(12,4,OR);p(13,4,EY);p(14,4,AR);p(15,4,ARD);
    p(9,5,ARD);p(10,5,AR);p(11,5,SK);p(12,5,SK);p(13,5,AR);p(14,5,ARD);
    p(10,6,AR);p(11,6,RD);p(12,6,RD);p(13,6,AR);
    // 갑옷 몸통
    p(7,7,ARD);p(8,7,AR);p(9,7,ARL);p(10,7,RD);p(11,7,RDD);p(12,7,RDD);p(13,7,RD);p(14,7,ARL);p(15,7,AR);p(16,7,ARD);
    p(6,8,ARD);p(7,8,RDD);p(8,8,ARL);p(9,8,AR);p(10,8,ARL);p(11,8,AR);p(12,8,AR);p(13,8,ARL);p(14,8,AR);p(15,8,ARL);p(16,8,RDD);p(17,8,ARD);
    p(6,9,AR);p(7,9,ARL);p(8,9,AR);p(9,9,RD);p(10,9,RDD);p(11,9,RD);p(12,9,RD);p(13,9,RDD);p(14,9,RD);p(15,9,AR);p(16,9,ARL);p(17,9,AR);
    p(7,10,ARD);p(8,10,AR);p(9,10,ARL);p(10,10,AR);p(11,10,RD);p(12,10,RD);p(13,10,AR);p(14,10,ARL);p(15,10,AR);p(16,10,ARD);
    p(8,11,ARD);p(9,11,ARL);p(10,11,RDD);p(11,11,AR);p(12,11,AR);p(13,11,RDD);p(14,11,ARL);p(15,11,ARD);
    // 불꽃 검 (오른쪽)
    p(18,3,YL);p(19,4,OR);p(18,4,YL);
    p(18,5,OR);p(19,5,RDL);p(18,6,RDL);
    p(17,6,SW);p(18,7,SW);p(17,7,SWL);
    p(16,7,SWD);p(16,8,SWL);p(15,8,SW);p(16,9,SWD);
    // 방패 (왼쪽)
    p(3,8,ARD);p(4,8,AR);p(5,8,ARL);p(4,9,RD);p(5,9,AR);p(6,9,ARL);p(4,10,ARL);p(5,10,RDD);p(6,10,AR);p(4,11,AR);p(5,11,ARL);
    // 다리
    p(9,12,ARD);p(10,12,AR);p(11,12,RDD);p(12,12,RDD);p(13,12,AR);p(14,12,ARD);
    p(9,13,AR);p(10,13,ARL);p(11,13,AR);p(12,13,AR);p(13,13,ARL);p(14,13,AR);
    p(9,14,ARD);p(10,14,AR);p(11,14,ARD);p(12,14,ARD);p(13,14,AR);p(14,14,ARD);
    p(8,15,ARD);p(9,15,AR);p(10,15,ARL);p(12,15,ARL);p(13,15,AR);p(14,15,ARD);
    return monsterSVG(px,scale);
}

// 심연의 마녀 (3막 전용 — 검은 로브, 보라/청록 오브, 해골 마스크)
function makeAbyssWitchSVG(scale) {
    scale=scale||5; let px=[]; function p(x,y,c){px.push([x,y,c]);}
    let BK='#0a0010',BKL='#1a0030',PU='#6600cc',PL='#aa44ff',PD='#33006a';
    let CY='#00eeff',CYL='#80f8ff',CYD='#007788';
    let BN='#d4c890',BND='#8a8050';
    let ST='#2a1a0a',STL='#6a4a2a'; // 지팡이
    let GD='#d4a820';
    // 뾰족한 마녀 모자
    p(11,0,BKL);p(12,0,BKL);
    p(10,1,BKL);p(11,1,PU);p(12,1,PU);p(13,1,BKL);
    p(9,2,BK);p(10,2,BKL);p(11,2,PU);p(12,2,PU);p(13,2,BKL);p(14,2,BK);
    p(7,3,BK);p(8,3,BKL);p(9,3,BKL);p(10,3,PD);p(11,3,PU);p(12,3,PU);p(13,3,PD);p(14,3,BKL);p(15,3,BKL);p(16,3,BK);
    p(7,4,PD);p(8,4,PU);p(9,4,PL);p(10,4,PU);p(11,4,BKL);p(12,4,BKL);p(13,4,PU);p(14,4,PL);p(15,4,PU);p(16,4,PD);
    // 해골 마스크 얼굴
    p(8,5,BKL);p(9,5,BN);p(10,5,BN);p(11,5,BN);p(12,5,BN);p(13,5,BN);p(14,5,BN);p(15,5,BKL);
    p(8,6,BKL);p(9,6,BN);p(10,6,CY);p(11,6,CYL);p(12,6,CYL);p(13,6,CY);p(14,6,BN);p(15,6,BKL);
    p(9,7,BND);p(10,7,BN);p(11,7,BN);p(12,7,BN);p(13,7,BN);p(14,7,BND);
    p(9,8,BN);p(10,8,BND);p(11,8,BK);p(12,8,BK);p(13,8,BND);p(14,8,BN);
    // 로브 상체
    p(6,9,PD);p(7,9,PU);p(8,9,PL);p(9,9,PU);p(10,9,PU);p(11,9,GD);p(12,9,GD);p(13,9,PU);p(14,9,PU);p(15,9,PL);p(16,9,PU);p(17,9,PD);
    p(5,10,PD);p(6,10,PU);p(7,10,PL);p(8,10,PU);p(9,10,BKL);p(10,10,CY);p(11,10,CYL);p(12,10,CYL);p(13,10,CY);p(14,10,BKL);p(15,10,PU);p(16,10,PL);p(17,10,PU);p(18,10,PD);
    p(5,11,PD);p(6,11,PU);p(7,11,PL);p(8,11,PU);p(9,11,PU);p(10,11,PU);p(11,11,GD);p(12,11,GD);p(13,11,PU);p(14,11,PU);p(15,11,PU);p(16,11,PL);p(17,11,PU);p(18,11,PD);
    // 지팡이 (왼쪽)
    p(2,4,CY);p(3,4,CYL);p(2,5,CYD);p(3,5,CY);p(4,5,CYL);
    p(3,6,STL);p(4,6,ST);p(3,7,ST);p(4,7,STL);p(3,8,STL);p(4,8,ST);
    p(3,9,ST);p(4,9,STL);p(3,10,STL);p(4,10,ST);p(3,11,ST);p(4,11,STL);
    // 로브 하의
    p(5,12,PD);p(6,12,PU);p(7,12,PL);p(8,12,PU);p(9,12,BKL);p(10,12,PU);p(11,12,PU);p(12,12,PU);p(13,12,BKL);p(14,12,PU);p(15,12,PL);p(16,12,PU);p(17,12,PD);
    p(5,13,PD);p(6,13,PD);p(7,13,PU);p(8,13,PL);p(9,13,PU);p(10,13,PU);p(11,13,CY);p(12,13,CY);p(13,13,PU);p(14,13,PL);p(15,13,PU);p(16,13,PD);p(17,13,PD);
    p(6,14,PD);p(7,14,PD);p(8,14,PU);p(9,14,PL);p(10,14,PU);p(11,14,PU);p(12,14,PU);p(13,14,PL);p(14,14,PU);p(15,14,PD);p(16,14,PD);
    return monsterSVG(px,scale);
}

MONSTER_SVG_MAP['dark_knight']   = makeDarkKnightSVG;
MONSTER_SVG_MAP['abyss_witch']   = makeAbyssWitchSVG;

// ══════════════════════════════════════════════
// 누락/중복 몬스터 SVG 추가 — 완전히 독립적인 디자인
// ══════════════════════════════════════════════

// 고블린 기사 (goblin과 다른 중갑옷 버전)
function makeGoblinKnightSVG(scale) {
    scale=scale||5; let px=[]; function p(x,y,c){px.push([x,y,c]);}
    let G='#2a5a1a',GL='#4a8a3a',GD='#0e3a08';
    let AR='#4a6a3a',ARL='#6a9a5a',ARD='#2a4a1a'; // 녹색 갑옷
    let SK='#c4986a',EY='#ff3300',WH='#fff';
    let SH='#8a7020',SHL='#c0a830',SHD='#504010'; // 방패
    let SP='#909090',SPL='#d0d0d0'; // 창
    // 투구
    p(8,1,ARD);p(9,1,AR);p(10,1,AR);p(11,1,ARL);p(12,1,ARL);p(13,1,AR);p(14,1,AR);p(15,1,ARD);
    p(8,2,AR);p(9,2,ARL);p(10,2,AR);p(11,2,AR);p(12,2,AR);p(13,2,AR);p(14,2,ARL);p(15,2,AR);
    p(8,3,ARD);p(9,3,AR);p(10,3,G);p(11,3,GL);p(12,3,GL);p(13,3,G);p(14,3,AR);p(15,3,ARD);
    // 눈 슬롯
    p(8,4,ARD);p(9,4,G);p(10,4,EY);p(11,4,WH);p(12,4,WH);p(13,4,EY);p(14,4,G);p(15,4,ARD);
    p(9,5,ARD);p(10,5,AR);p(11,5,G);p(12,5,G);p(13,5,AR);p(14,5,ARD);
    p(10,6,G);p(11,6,G);p(12,6,G);
    // 어깨+몸
    p(6,7,ARD);p(7,7,ARL);p(8,7,AR);p(9,7,ARL);p(10,7,SHL);p(11,7,SHL);p(12,7,ARL);p(13,7,ARL);p(14,7,AR);p(15,7,ARL);p(16,7,ARD);
    p(6,8,ARD);p(7,8,AR);p(8,8,ARL);p(9,8,AR);p(10,8,AR);p(11,8,ARL);p(12,8,ARL);p(13,8,AR);p(14,8,ARL);p(15,8,AR);p(16,8,ARD);
    p(7,9,AR);p(8,9,ARL);p(9,9,AR);p(10,9,SHL);p(11,9,SH);p(12,9,SHL);p(13,9,AR);p(14,9,ARL);p(15,9,AR);
    p(7,10,ARD);p(8,10,AR);p(9,10,ARL);p(10,10,AR);p(11,10,AR);p(12,10,AR);p(13,10,ARL);p(14,10,AR);p(15,10,ARD);
    // 방패(왼)
    p(2,7,SHD);p(3,7,SH);p(4,7,SHL);p(5,7,SHD);
    p(2,8,SH);p(3,8,SHL);p(4,8,SHL);p(5,8,SH);
    p(2,9,SHD);p(3,9,SH);p(4,9,EY);p(5,9,SH);
    p(2,10,SH);p(3,10,SHL);p(4,10,SHL);p(5,10,SH);
    p(3,11,SHD);p(4,11,SH);
    // 창(오른)
    p(18,1,SPL);p(18,2,SP);p(17,3,SP);p(18,3,SPL);p(18,4,SP);p(18,5,SP);p(17,5,SP);
    p(17,6,SP);p(17,7,SP);p(17,8,SP);p(17,9,SP);p(17,10,SP);
    // 하체
    p(8,11,ARD);p(9,11,AR);p(10,11,ARL);p(11,11,G);p(12,11,G);p(13,11,ARL);p(14,11,AR);p(15,11,ARD);
    p(8,12,AR);p(9,12,G);p(10,12,GL);p(11,12,G);p(12,12,G);p(13,12,GL);p(14,12,G);p(15,12,AR);
    p(8,13,G);p(9,13,GL);p(10,13,G);p(11,13,ARD);p(12,13,ARD);p(13,13,G);p(14,13,GL);p(15,13,G);
    p(9,14,ARD);p(10,14,AR);p(11,14,ARL);p(12,14,ARL);p(13,14,AR);p(14,14,ARD);
    return monsterSVG(px,scale);
}

// 고블린 군주 보스 (기존 goblin_boss와 다른 더 웅장한 버전)
function makeGoblinKingSVG(scale) {
    scale=scale||5; let px=[]; function p(x,y,c){px.push([x,y,c]);}
    let G='#1a4a0a',GL='#3a7a2a',GD='#0a2804';
    let CR='#c8a020',CRL='#f0cc50',CRD='#806010'; // 황금 왕관
    let AR='#5a4010',ARL='#8a6020',ARD='#3a2808';
    let SK='#c09060',EY='#ff0000',WH='#fff';
    let SC='#c08030',SCL='#e8b050'; // 홀
    // 왕관
    p(8,0,CRD);p(9,0,CR);p(11,0,CR);p(13,0,CR);p(15,0,CRD);
    p(8,1,CR);p(9,1,CRL);p(10,1,CR);p(11,1,CRL);p(12,1,CR);p(13,1,CRL);p(14,1,CR);p(15,1,CR);
    p(7,2,CRD);p(8,2,CR);p(9,2,CR);p(10,2,CR);p(11,2,CR);p(12,2,CR);p(13,2,CR);p(14,2,CR);p(15,2,CR);p(16,2,CRD);
    // 머리 (크게)
    p(7,3,GD);p(8,3,G);p(9,3,GL);p(10,3,SK);p(11,3,SK);p(12,3,SK);p(13,3,SK);p(14,3,GL);p(15,3,G);p(16,3,GD);
    p(7,4,G);p(8,4,GL);p(9,4,SK);p(10,4,EY);p(11,4,WH);p(12,4,WH);p(13,4,EY);p(14,4,SK);p(15,4,GL);p(16,4,G);
    p(7,5,G);p(8,5,GL);p(9,5,SK);p(10,5,SK);p(11,5,SK);p(12,5,SK);p(13,5,SK);p(14,5,SK);p(15,5,GL);p(16,5,G);
    p(8,6,GD);p(9,6,SK);p(10,6,'#a06040');p(11,6,'#c07050');p(12,6,'#c07050');p(13,6,'#a06040');p(14,6,SK);p(15,6,GD);
    p(9,7,GD);p(10,7,G);p(11,7,GL);p(12,7,GL);p(13,7,G);p(14,7,GD);
    // 거대 몸통 + 갑옷
    p(5,8,ARD);p(6,8,AR);p(7,8,ARL);p(8,8,AR);p(9,8,CRL);p(10,8,CR);p(11,8,CRD);p(12,8,CRD);p(13,8,CR);p(14,8,CRL);p(15,8,AR);p(16,8,ARL);p(17,8,ARD);
    p(5,9,ARD);p(6,9,ARL);p(7,9,AR);p(8,9,ARL);p(9,9,AR);p(10,9,CR);p(11,9,CRL);p(12,9,CRL);p(13,9,CR);p(14,9,AR);p(15,9,ARL);p(16,9,AR);p(17,9,ARD);
    p(5,10,AR);p(6,10,ARL);p(7,10,AR);p(8,10,CRD);p(9,10,AR);p(10,10,ARL);p(11,10,AR);p(12,10,AR);p(13,10,ARL);p(14,10,AR);p(15,10,CRD);p(16,10,ARL);p(17,10,AR);
    p(6,11,ARD);p(7,11,AR);p(8,11,ARL);p(9,11,AR);p(10,11,CR);p(11,11,CRL);p(12,11,CRL);p(13,11,CR);p(14,11,AR);p(15,11,ARL);p(16,11,ARD);
    // 홀(왕홀)
    p(19,3,SCL);p(20,4,SC);p(19,4,SCL);p(20,5,SCL);p(19,5,SC);
    p(18,6,SC);p(18,7,SCL);p(18,8,SC);p(18,9,SC);p(18,10,SCL);
    // 다리
    p(8,12,ARD);p(9,12,AR);p(10,12,G);p(11,12,GL);p(12,12,GL);p(13,12,G);p(14,12,AR);p(15,12,ARD);
    p(8,13,AR);p(9,13,G);p(10,13,GL);p(11,13,G);p(12,13,G);p(13,13,GL);p(14,13,G);p(15,13,AR);
    p(8,14,GD);p(9,14,G);p(10,14,G);p(11,14,ARD);p(12,14,ARD);p(13,14,G);p(14,14,G);p(15,14,GD);
    p(8,15,ARD);p(9,15,AR);p(10,15,ARL);p(12,15,ARL);p(13,15,AR);p(14,15,ARD);
    return monsterSVG(px,scale);
}

// 리치 군주 (undead_lord용 — 기존 lich와 완전 다른 디자인, 더 웅장)
function makeUndeadKingSVG(scale) {
    scale=scale||5; let px=[]; function p(x,y,c){px.push([x,y,c]);}
    let BK='#0a0010',BKL='#18002a',PU='#7700cc',PL='#bb55ee',PD='#4400aa';
    let BN='#d8d0a8',BND='#9a9070',BNL='#ffffee';
    let CY='#00eeff',MG='#ff00cc',GD='#d4a820',GL='#f0cc50';
    let RD='#cc0000',WH='#ffffff';
    // 떠다니는 왕관 (공중에)
    p(9,0,GD);p(10,0,GD);p(11,0,GD);p(12,0,GD);p(13,0,GD);p(14,0,GD);
    p(8,1,GL);p(9,1,CY);p(10,1,GL);p(11,1,MG);p(12,1,GL);p(13,1,CY);p(14,1,GL);p(15,1,GL);
    p(7,2,GD);p(8,2,GL);p(9,2,GL);p(10,2,GD);p(11,2,GD);p(12,2,GD);p(13,2,GL);p(14,2,GL);p(15,2,GD);p(16,2,GD);
    // 거대 해골 머리
    p(7,3,BND);p(8,3,BN);p(9,3,BNL);p(10,3,BNL);p(11,3,BNL);p(12,3,BNL);p(13,3,BNL);p(14,3,BN);p(15,3,BND);
    p(7,4,BN);p(8,4,BNL);p(9,4,CY);p(10,4,WH);p(11,4,BNL);p(12,4,BNL);p(13,4,WH);p(14,4,CY);p(15,4,BNL);p(16,4,BN);
    p(7,5,BN);p(8,5,BND);p(9,5,BN);p(10,5,BND);p(11,5,BN);p(12,5,BN);p(13,5,BND);p(14,5,BN);p(15,5,BND);p(16,5,BN);
    p(7,6,BND);p(8,6,BN);p(9,6,BN);p(10,6,BN);p(11,6,BN);p(12,6,BN);p(13,6,BN);p(14,6,BN);p(15,6,BN);p(16,6,BND);
    p(8,7,BND);p(9,7,BN);p(10,7,RD);p(11,7,BND);p(12,7,BND);p(13,7,RD);p(14,7,BN);p(15,7,BND);
    p(9,8,BND);p(10,8,BN);p(11,8,BND);p(12,8,BND);p(13,8,BN);p(14,8,BND);
    // 거대 로브
    p(4,9,BKL);p(5,9,PD);p(6,9,PU);p(7,9,PL);p(8,9,BN);p(9,9,PU);p(10,9,CY);p(11,9,GD);p(12,9,GD);p(13,9,CY);p(14,9,PU);p(15,9,BN);p(16,9,PL);p(17,9,PU);p(18,9,PD);p(19,9,BKL);
    p(3,10,BKL);p(4,10,PD);p(5,10,PU);p(6,10,PL);p(7,10,PU);p(8,10,PD);p(9,10,MG);p(10,10,MG);p(11,10,GD);p(12,10,GD);p(13,10,MG);p(14,10,MG);p(15,10,PD);p(16,10,PU);p(17,10,PL);p(18,10,PU);p(19,10,PD);p(20,10,BKL);
    p(3,11,BKL);p(4,11,PD);p(5,11,PU);p(6,11,PL);p(7,11,PU);p(8,11,PU);p(9,11,PD);p(10,11,PU);p(11,11,CY);p(12,11,CY);p(13,11,PU);p(14,11,PD);p(15,11,PU);p(16,11,PU);p(17,11,PL);p(18,11,PU);p(19,11,PD);p(20,11,BKL);
    // 양 손에서 나오는 오브
    p(1,8,CY);p(2,8,MG);p(2,9,CY);p(1,9,MG);p(1,10,CY);p(2,10,MG);
    p(21,8,CY);p(22,8,MG);p(21,9,MG);p(22,9,CY);p(21,10,MG);p(22,10,CY);
    // 하의
    p(4,12,BKL);p(5,12,PD);p(6,12,PU);p(7,12,PL);p(8,12,PU);p(9,12,PD);p(10,12,CY);p(11,12,CY);p(12,12,CY);p(13,12,CY);p(14,12,PD);p(15,12,PU);p(16,12,PL);p(17,12,PU);p(18,12,PD);p(19,12,BKL);
    p(5,13,BKL);p(6,13,PD);p(7,13,PU);p(8,13,PL);p(9,13,PU);p(10,13,PU);p(11,13,PD);p(12,13,PD);p(13,13,PU);p(14,13,PU);p(15,13,PL);p(16,13,PU);p(17,13,PD);p(18,13,BKL);
    return monsterSVG(px,scale);
}

// 균열 드래곤 (dragon 키 교체용 — 3막 보스급 더 웅장)
function makeCrackDragonSVG(scale) {
    scale=scale||5; let px=[]; function p(x,y,c){px.push([x,y,c]);}
    let PU='#6600aa',PL='#cc55ff',PD='#3d0070',PF='#ee88ff';
    let GD='#d4a820',GL='#f0cc50',CY='#00eeff',CYL='#88f8ff';
    let RD='#ff2200',EY='#ffff00',BK='#000000';
    let SC='#9922cc',SCD='#550088';
    // 날개 L
    p(0,4,PD);p(1,4,PU);p(2,4,PL);p(0,5,PD);p(1,5,PU);p(2,5,PL);p(3,5,PL);
    p(0,6,PD);p(1,6,PU);p(2,6,PL);p(3,6,PL);p(4,6,PF);
    p(1,7,PD);p(2,7,PU);p(3,7,PL);p(4,7,PF);p(5,7,PF);
    p(2,8,PD);p(3,8,PU);p(4,8,PL);p(5,8,PF);p(6,8,PF);
    p(3,9,PD);p(4,9,PU);p(5,9,PL);p(6,9,PL);
    p(3,10,PD);p(4,10,PU);p(5,10,PL);
    // 날개 R
    p(23,4,PD);p(22,4,PU);p(21,4,PL);p(23,5,PD);p(22,5,PU);p(21,5,PL);p(20,5,PL);
    p(23,6,PD);p(22,6,PU);p(21,6,PL);p(20,6,PL);p(19,6,PF);
    p(22,7,PD);p(21,7,PU);p(20,7,PL);p(19,7,PF);p(18,7,PF);
    p(21,8,PD);p(20,8,PU);p(19,8,PL);p(18,8,PF);p(17,8,PF);
    p(20,9,PD);p(19,9,PU);p(18,9,PL);p(17,9,PL);
    p(20,10,PD);p(19,10,PU);p(18,10,PL);
    // 머리 + 뿔
    p(10,0,GD);p(11,0,GL);p(13,0,GL);p(14,0,GD); // 뿔
    p(9,1,PD);p(10,1,PU);p(11,1,PL);p(12,1,PL);p(13,1,PL);p(14,1,PU);p(15,1,PD);
    p(8,2,PD);p(9,2,PU);p(10,2,PF);p(11,2,PL);p(12,2,PL);p(13,2,PF);p(14,2,PU);p(15,2,PD);
    p(8,3,PU);p(9,3,PF);p(10,3,EY);p(11,3,EY);p(12,3,PL);p(13,3,EY);p(14,3,EY);p(15,3,PF);p(16,3,PU);
    p(9,4,PD);p(10,4,PU);p(11,4,PL);p(12,4,PL);p(13,4,PL);p(14,4,PU);p(15,4,PD);
    p(10,5,PD);p(11,5,CY);p(12,5,CYL);p(13,5,CY);p(14,5,PD); // 균열 에너지
    p(11,6,RD);p(12,6,BK);p(13,6,RD); // 이빨
    // 몸통 (균열 에너지로 빛남)
    p(7,7,PD);p(8,7,PU);p(9,7,SC);p(10,7,PL);p(11,7,CY);p(12,7,CYL);p(13,7,CY);p(14,7,PL);p(15,7,SC);p(16,7,PU);p(17,7,PD);
    p(7,8,SCD);p(8,8,SC);p(9,8,PU);p(10,8,PL);p(11,8,PF);p(12,8,PF);p(13,8,PF);p(14,8,PL);p(15,8,PU);p(16,8,SC);p(17,8,SCD);
    p(7,9,PD);p(8,9,SC);p(9,9,PU);p(10,9,PL);p(11,9,CY);p(12,9,GD);p(13,9,CY);p(14,9,PL);p(15,9,PU);p(16,9,SC);p(17,9,PD);
    p(7,10,PD);p(8,10,PU);p(9,10,SC);p(10,10,PU);p(11,10,PL);p(12,10,PL);p(13,10,PU);p(14,10,SC);p(15,10,PU);p(16,10,PD);
    // 발톱
    p(8,11,SCD);p(9,11,SC);p(10,11,PU);p(11,11,PL);p(12,11,PL);p(13,11,PU);p(14,11,SC);p(15,11,SCD);
    p(8,12,SCD);p(9,12,PD);p(10,12,GD);p(11,12,GL);p(12,12,GL);p(13,12,GD);p(14,12,PD);p(15,12,SCD);
    // 꼬리
    p(5,10,PD);p(6,11,PU);p(5,11,PD);p(5,12,PU);p(4,12,PD);p(4,13,PL);p(3,13,PD);p(3,14,GD);
    return monsterSVG(px,scale);
}

// SVG 맵 업데이트 — 중복 키 고유화
MONSTER_SVG_MAP['goblin_knight']  = makeGoblinKnightSVG;   // 고블린 기사용
MONSTER_SVG_MAP['goblin_king']    = makeGoblinKingSVG;      // 고블린 군왕용
MONSTER_SVG_MAP['undead_king']    = makeUndeadKingSVG;      // 언데드 군주용
MONSTER_SVG_MAP['crack_dragon']   = makeCrackDragonSVG;     // 3막 보스 드래곤용

// ══════════════════════════════════════════════
// 3막 엘리트 전용 — 폭염의 군주 (inferno_lord)
// ══════════════════════════════════════════════
function makeInfernoLordSVG(scale) {
    scale=scale||5; let px=[]; function p(x,y,c){px.push([x,y,c]);}
    let RD='#cc2200',RL='#ff4400',RLL='#ff7700',OR='#ff9900',YL='#ffcc00';
    let BK='#1a0500',BKL='#330a00',AR='#4a1a00',ARL='#7a3000';
    let GD='#d4a820',GL='#f0cc50',EY='#ffff00',WH='#ffffff';
    let CR='#ff0000',CRL='#ff6600'; // 크라운 불꽃

    // 불꽃 왕관
    p(9,0,CRL);p(10,0,CR);p(11,0,YL);p(12,0,YL);p(13,0,CR);p(14,0,CRL);
    p(8,1,CR);p(9,1,OR);p(10,1,YL);p(11,1,GL);p(12,1,GL);p(13,1,YL);p(14,1,OR);p(15,1,CR);
    p(7,2,GD);p(8,2,GL);p(9,2,GD);p(10,2,GL);p(11,2,GD);p(12,2,GD);p(13,2,GL);p(14,2,GD);p(15,2,GL);p(16,2,GD);

    // 머리 — 갑옷+불꽃 마스크
    p(8,3,AR);p(9,3,ARL);p(10,3,OR);p(11,3,YL);p(12,3,YL);p(13,3,OR);p(14,3,ARL);p(15,3,AR);
    p(7,4,BK);p(8,4,AR);p(9,4,ARL);p(10,4,EY);p(11,4,WH);p(12,4,WH);p(13,4,EY);p(14,4,ARL);p(15,4,AR);p(16,4,BK);
    p(7,5,BKL);p(8,5,AR);p(9,5,ARL);p(10,5,OR);p(11,5,OR);p(12,5,OR);p(13,5,OR);p(14,5,ARL);p(15,5,AR);p(16,5,BKL);
    p(8,6,BK);p(9,6,RD);p(10,6,RL);p(11,6,BK);p(12,6,BK);p(13,6,RL);p(14,6,RD);p(15,6,BK);
    p(9,7,BKL);p(10,7,AR);p(11,7,ARL);p(12,7,ARL);p(13,7,AR);p(14,7,BKL);

    // 어깨 — 크고 위협적인 갑옷
    p(4,7,OR);p(5,7,RLL);p(6,7,RL);p(18,7,OR);p(17,7,RLL);p(16,7,RL);
    p(3,8,YL);p(4,8,OR);p(5,8,RLL);p(6,8,RL);p(20,8,YL);p(19,8,OR);p(18,8,RLL);p(17,8,RL);
    p(2,9,OR);p(3,9,OR);p(4,9,RLL);p(5,9,RL);p(21,9,OR);p(20,9,OR);p(19,9,RLL);p(18,9,RL);

    // 몸통
    p(6,8,BK);p(7,8,AR);p(8,8,ARL);p(9,8,OR);p(10,8,GD);p(11,8,GL);p(12,8,GL);p(13,8,GD);p(14,8,OR);p(15,8,ARL);p(16,8,AR);p(17,8,BK);
    p(6,9,BKL);p(7,9,AR);p(8,9,ARL);p(9,9,RL);p(10,9,OR);p(11,9,YL);p(12,9,YL);p(13,9,OR);p(14,9,RL);p(15,9,ARL);p(16,9,AR);p(17,9,BKL);
    p(6,10,BK);p(7,10,ARL);p(8,10,AR);p(9,10,RD);p(10,10,RL);p(11,10,OR);p(12,10,OR);p(13,10,RL);p(14,10,RD);p(15,10,AR);p(16,10,ARL);p(17,10,BK);
    p(7,11,BKL);p(8,11,AR);p(9,11,ARL);p(10,11,GD);p(11,11,GL);p(12,11,GL);p(13,11,GD);p(14,11,ARL);p(15,11,AR);p(16,11,BKL);

    // 불꽃 팔
    p(4,10,RLL);p(3,10,RL);p(2,10,RD);p(2,11,OR);p(3,11,YL);p(1,11,RD);p(1,12,RL);p(2,12,OR);
    p(19,10,RLL);p(20,10,RL);p(21,10,RD);p(21,11,OR);p(20,11,YL);p(22,11,RD);p(22,12,RL);p(21,12,OR);

    // 다리
    p(8,12,BK);p(9,12,AR);p(10,12,RD);p(11,12,RL);p(12,12,RL);p(13,12,RD);p(14,12,AR);p(15,12,BK);
    p(8,13,BKL);p(9,13,AR);p(10,13,ARL);p(11,13,AR);p(12,13,AR);p(13,13,ARL);p(14,13,AR);p(15,13,BKL);
    p(8,14,BK);p(9,14,GD);p(10,14,GL);p(11,14,GD);p(12,14,GD);p(13,14,GL);p(14,14,GD);p(15,14,BK);
    return monsterSVG(px,scale);
}

// ══════════════════════════════════════════════
// 3막 추가 보스들
// ══════════════════════════════════════════════

// 균열의 포식자 (3막 대체 보스 1)
function makeVoidBehemothSVG(scale) {
    scale=scale||5; let px=[]; function p(x,y,c){px.push([x,y,c]);}
    let BK='#0a0015',BKL='#150025',PU='#5500bb',PL='#9933ff',PF='#cc66ff';
    let CY='#00ddff',CYD='#008899',GD='#d4a820',GL='#f0cc50';
    let EY='#ff00ff',RD='#dd0000';

    // 촉수 왕관
    p(7,0,PU);p(9,0,PL);p(11,0,CY);p(13,0,PL);p(15,0,PU);p(17,0,PU);
    p(6,1,BKL);p(8,1,PU);p(10,1,PL);p(12,1,CY);p(14,1,PL);p(16,1,PU);p(18,1,BKL);

    // 거대 머리
    p(6,2,BKL);p(7,2,PU);p(8,2,PL);p(9,2,PF);p(10,2,PF);p(11,2,CY);p(12,2,CY);p(13,2,PF);p(14,2,PF);p(15,2,PL);p(16,2,PU);p(17,2,BKL);
    p(5,3,PU);p(6,3,PL);p(7,3,PF);p(8,3,EY);p(9,3,CY);p(10,3,PF);p(11,3,PF);p(12,3,PF);p(13,3,CY);p(14,3,EY);p(15,3,PF);p(16,3,PL);p(17,3,PL);p(18,3,PU);
    p(5,4,BKL);p(6,4,PU);p(7,4,PL);p(8,4,BK);p(9,4,PF);p(10,4,CY);p(11,4,CY);p(12,4,CY);p(13,4,CY);p(14,4,PF);p(15,4,BK);p(16,4,PL);p(17,4,PU);p(18,4,BKL);
    p(5,5,PU);p(6,5,PL);p(7,5,RD);p(8,5,RD);p(9,5,PF);p(10,5,PF);p(11,5,GL);p(12,5,GL);p(13,5,PF);p(14,5,PF);p(15,5,RD);p(16,5,RD);p(17,5,PL);p(18,5,PU);
    p(6,6,BKL);p(7,6,PU);p(8,6,PL);p(9,6,PF);p(10,6,GD);p(11,6,GL);p(12,6,GL);p(13,6,GD);p(14,6,PF);p(15,6,PL);p(16,6,PU);p(17,6,BKL);

    // 거대 몸통
    p(4,7,PU);p(5,7,PL);p(6,7,PF);p(7,7,CY);p(8,7,PF);p(9,7,PL);p(10,7,PU);p(11,7,EY);p(12,7,EY);p(13,7,PU);p(14,7,PL);p(15,7,PF);p(16,7,CY);p(17,7,PF);p(18,7,PL);p(19,7,PU);
    p(3,8,BKL);p(4,8,PU);p(5,8,PL);p(6,8,CY);p(7,8,PF);p(8,8,PL);p(9,8,PU);p(10,8,BKL);p(11,8,CY);p(12,8,CY);p(13,8,BKL);p(14,8,PU);p(15,8,PL);p(16,8,PF);p(17,8,CY);p(18,8,PL);p(19,8,PU);p(20,8,BKL);
    p(3,9,PU);p(4,9,PL);p(5,9,PF);p(6,9,CY);p(7,9,GD);p(8,9,GL);p(9,9,GD);p(10,9,PF);p(11,9,PL);p(12,9,PL);p(13,9,PF);p(14,9,GD);p(15,9,GL);p(16,9,GD);p(17,9,CY);p(18,9,PF);p(19,9,PL);p(20,9,PU);
    p(4,10,BKL);p(5,10,PU);p(6,10,PL);p(7,10,PF);p(8,10,CY);p(9,10,PF);p(10,10,PL);p(11,10,PU);p(12,10,PU);p(13,10,PL);p(14,10,PF);p(15,10,CY);p(16,10,PF);p(17,10,PL);p(18,10,PU);p(19,10,BKL);

    // 촉수 하단
    p(5,11,PU);p(6,11,PL);p(8,11,CY);p(10,11,PF);p(12,11,PF);p(14,11,CY);p(16,11,PL);p(17,11,PU);
    p(4,12,BKL);p(5,12,PU);p(7,12,PL);p(9,12,CY);p(11,12,EY);p(13,12,EY);p(15,12,CY);p(17,12,PL);p(18,12,BKL);
    p(4,13,PU);p(6,13,PL);p(8,13,CY);p(10,13,PF);p(14,13,PF);p(16,13,CY);p(18,13,PU);
    return monsterSVG(px,scale);
}

// 뼈의 황제 (2막 추가 보스)
function makeBoneEmperorSVG(scale) {
    scale=scale||5; let px=[]; function p(x,y,c){px.push([x,y,c]);}
    let BN='#e8e0b8',BNL='#fffff0',BND='#b0a870',BNX='#88804a';
    let GD='#d4a820',GL='#f0cc50',GDD='#886010';
    let PU='#6600aa',PL='#bb44ee',CY='#00ccff';
    let RD='#cc0000',EY='#ff4400',BK='#000000';

    // 3단 왕관
    p(9,0,GD);p(10,0,GL);p(11,0,GD);p(12,0,GL);p(13,0,GD);
    p(8,1,GDD);p(9,1,GL);p(10,1,GD);p(11,1,GL);p(12,1,GD);p(13,1,GL);p(14,1,GDD);
    p(7,2,GD);p(8,2,GL);p(9,2,GDD);p(10,2,GL);p(11,2,GD);p(12,2,GL);p(13,2,GDD);p(14,2,GL);p(15,2,GD);

    // 해골 황제 머리
    p(7,3,BND);p(8,3,BN);p(9,3,BNL);p(10,3,BNL);p(11,3,BNL);p(12,3,BNL);p(13,3,BNL);p(14,3,BN);p(15,3,BND);
    p(6,4,BND);p(7,4,BN);p(8,4,BNL);p(9,4,EY);p(10,4,RD);p(11,4,BNL);p(12,4,RD);p(13,4,EY);p(14,4,BNL);p(15,4,BN);p(16,4,BND);
    p(6,5,BN);p(7,5,BNL);p(8,5,BN);p(9,5,BND);p(10,5,BN);p(11,5,BNL);p(12,5,BNL);p(13,5,BN);p(14,5,BND);p(15,5,BNL);p(16,5,BN);
    p(6,6,BND);p(7,6,BN);p(8,6,BNL);p(9,6,BN);p(10,6,GD);p(11,6,GL);p(12,6,GL);p(13,6,GD);p(14,6,BN);p(15,6,BNL);p(16,6,BND);
    p(7,7,BND);p(8,7,BN);p(9,7,RD);p(10,7,BK);p(11,7,BND);p(12,7,BND);p(13,7,BK);p(14,7,RD);p(15,7,BN);p(16,7,BND);

    // 뼈 갑옷 몸통
    p(5,8,GDD);p(6,8,GD);p(7,8,GL);p(8,8,BN);p(9,8,BNL);p(10,8,PL);p(11,8,CY);p(12,8,CY);p(13,8,PL);p(14,8,BNL);p(15,8,BN);p(16,8,GL);p(17,8,GD);p(18,8,GDD);
    p(4,9,GD);p(5,9,GL);p(6,9,BN);p(7,9,BNL);p(8,9,BN);p(9,9,PU);p(10,9,PL);p(11,9,BNL);p(12,9,BNL);p(13,9,PL);p(14,9,PU);p(15,9,BN);p(16,9,BNL);p(17,9,BN);p(18,9,GL);p(19,9,GD);
    p(4,10,GDD);p(5,10,BN);p(6,10,BNL);p(7,10,GD);p(8,10,GL);p(9,10,BN);p(10,10,BNL);p(11,10,BN);p(12,10,BN);p(13,10,BNL);p(14,10,BN);p(15,10,GL);p(16,10,GD);p(17,10,BNL);p(18,10,BN);p(19,10,GDD);
    p(5,11,GD);p(6,11,GL);p(7,11,BN);p(8,11,BNL);p(9,11,CY);p(10,11,GL);p(11,11,GD);p(12,11,GD);p(13,11,GL);p(14,11,CY);p(15,11,BNL);p(16,11,BN);p(17,11,GL);p(18,11,GD);

    // 다리
    p(8,12,GDD);p(9,12,GD);p(10,12,BN);p(11,12,BNL);p(12,12,BNL);p(13,12,BN);p(14,12,GD);p(15,12,GDD);
    p(8,13,BND);p(9,13,BN);p(10,13,BNL);p(11,13,BN);p(12,13,BN);p(13,13,BNL);p(14,13,BN);p(15,13,BND);
    p(8,14,GD);p(9,14,GL);p(10,14,BND);p(11,14,BN);p(12,14,BN);p(13,14,BND);p(14,14,GL);p(15,14,GD);
    return monsterSVG(px,scale);
}

// 1막 추가 보스 — 가시 마녀
function makeThornWitchSVG(scale) {
    scale=scale||5; let px=[]; function p(x,y,c){px.push([x,y,c]);}
    let GN='#1a5a0a',GL='#3a9a2a',GD='#0a3004',GLL='#60cc40';
    let BR='#5a3010',BRL='#8a5020',TH='#2a1a00';
    let PK='#cc2255',PKL='#ff4488',PKD='#880033';
    let YL='#ccaa00',EY='#ff0066',BK='#000';

    // 가시 왕관 (식물)
    p(8,0,GD);p(10,0,GL);p(12,0,GLL);p(14,0,GL);p(16,0,GD);
    p(7,1,GN);p(9,1,GL);p(11,1,GLL);p(13,1,GLL);p(15,1,GL);p(17,1,GN);
    p(7,2,GD);p(8,2,GN);p(9,2,GL);p(10,2,GLL);p(11,2,GN);p(12,2,GLL);p(13,2,GN);p(14,2,GLL);p(15,2,GL);p(16,2,GN);p(17,2,GD);

    // 얼굴 — 고블린계 마녀
    p(7,3,GD);p(8,3,GN);p(9,3,GL);p(10,3,GLL);p(11,3,GLL);p(12,3,GLL);p(13,3,GLL);p(14,3,GL);p(15,3,GN);p(16,3,GD);
    p(7,4,GN);p(8,4,GL);p(9,4,EY);p(10,4,GLL);p(11,4,GLL);p(12,4,GLL);p(13,4,GLL);p(14,4,EY);p(15,4,GL);p(16,4,GN);
    p(8,5,GD);p(9,5,GN);p(10,5,GL);p(11,5,GLL);p(12,5,GLL);p(13,5,GL);p(14,5,GN);p(15,5,GD);
    p(9,6,GD);p(10,6,PKL);p(11,6,PK);p(12,6,PK);p(13,6,PKL);p(14,6,GD);
    p(10,7,GD);p(11,7,GN);p(12,7,GN);p(13,7,GD);

    // 가시 로브
    p(5,8,GD);p(6,8,GN);p(7,8,GL);p(8,8,BR);p(9,8,BRL);p(10,8,PK);p(11,8,PKL);p(12,8,PKL);p(13,8,PK);p(14,8,BRL);p(15,8,BR);p(16,8,GL);p(17,8,GN);p(18,8,GD);
    p(4,9,GD);p(5,9,GL);p(6,9,GN);p(7,9,BR);p(8,9,BRL);p(9,9,GN);p(10,9,GL);p(11,9,PK);p(12,9,PK);p(13,9,GL);p(14,9,GN);p(15,9,BRL);p(16,9,BR);p(17,9,GN);p(18,9,GL);p(19,9,GD);
    p(4,10,GD);p(5,10,GN);p(6,10,GL);p(7,10,GLL);p(8,10,GN);p(9,10,BRL);p(10,10,PKL);p(11,10,PK);p(12,10,PK);p(13,10,PKL);p(14,10,BRL);p(15,10,GN);p(16,10,GLL);p(17,10,GL);p(18,10,GN);p(19,10,GD);
    p(5,11,GD);p(6,11,GL);p(7,11,GN);p(8,11,GLL);p(9,11,GN);p(10,11,GL);p(11,11,YL);p(12,11,YL);p(13,11,GL);p(14,11,GN);p(15,11,GLL);p(16,11,GN);p(17,11,GL);p(18,11,GD);

    // 지팡이 (가시 덩굴)
    p(2,5,GLL);p(3,5,GL);p(2,6,GN);p(3,6,GLL);p(3,7,GL);p(3,8,GN);p(3,9,GL);p(3,10,GLL);p(3,11,GN);
    p(1,8,PKL);p(2,8,PK);p(1,9,PK);p(2,9,PKL);

    // 가시 하의
    p(6,12,GD);p(7,12,GN);p(8,12,GL);p(9,12,GLL);p(10,12,GN);p(11,12,GL);p(12,12,GL);p(13,12,GN);p(14,12,GLL);p(15,12,GL);p(16,12,GN);p(17,12,GD);
    p(7,13,GD);p(8,13,GN);p(9,13,GL);p(10,13,GD);p(11,13,GN);p(12,13,GN);p(13,13,GD);p(14,13,GL);p(15,13,GN);p(16,13,GD);
    return monsterSVG(px,scale);
}

MONSTER_SVG_MAP['inferno_lord']   = makeInfernoLordSVG;
MONSTER_SVG_MAP['void_behemoth']  = makeVoidBehemothSVG;
MONSTER_SVG_MAP['bone_emperor']   = makeBoneEmperorSVG;
MONSTER_SVG_MAP['thorn_witch']    = makeThornWitchSVG;
