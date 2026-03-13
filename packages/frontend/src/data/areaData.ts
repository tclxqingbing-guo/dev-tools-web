const provinces = [
  '北京市',
  '天津市',
  '河北省',
  '山西省',
  '内蒙古自治区',
  '辽宁省',
  '吉林省',
  '黑龙江省',
  '上海市',
  '江苏省',
  '浙江省',
  '安徽省',
  '福建省',
  '江西省',
  '山东省',
  '河南省',
  '湖北省',
  '湖南省',
  '广东省',
  '广西壮族自治区',
  '海南省',
  '重庆市',
  '四川省',
  '贵州省',
  '云南省',
  '西藏自治区',
  '陕西省',
  '甘肃省',
  '青海省',
  '宁夏回族自治区',
  '新疆维吾尔自治区',
  '台湾省',
  '香港特别行政区',
  '澳门特别行政区',
];

const cities = {
  北京市: [
    {
      cityId: '110000',
      cityName: '北京市',
    },
    {
      市辖区: [
        {
          cityId: '110100',
          cityName: '市辖区',
        },
        {
          cityId: '110101',
          cityName: '东城区',
        },
        {
          cityId: '110102',
          cityName: '西城区',
        },
        {
          cityId: '110103',
          cityName: '崇文区',
        },
        {
          cityId: '110104',
          cityName: '宣武区',
        },
        {
          cityId: '110105',
          cityName: '朝阳区',
        },
        {
          cityId: '110106',
          cityName: '丰台区',
        },
        {
          cityId: '110107',
          cityName: '石景山区',
        },
        {
          cityId: '110108',
          cityName: '海淀区',
        },
        {
          cityId: '110109',
          cityName: '门头沟区',
        },
        {
          cityId: '110111',
          cityName: '房山区',
        },
        {
          cityId: '110112',
          cityName: '通州区',
        },
        {
          cityId: '110113',
          cityName: '顺义区',
        },
        {
          cityId: '110114',
          cityName: '昌平区',
        },
        {
          cityId: '110115',
          cityName: '大兴区',
        },
        {
          cityId: '110116',
          cityName: '怀柔区',
        },
        {
          cityId: '110117',
          cityName: '平谷区',
        },
      ],
    },
    {
      县: [
        {
          cityId: '110200',
          cityName: '县',
        },
        {
          cityId: '110228',
          cityName: '密云县',
        },
        {
          cityId: '110229',
          cityName: '延庆县',
        },
      ],
    },
  ],
  天津市: [
    {
      cityId: '120000',
      cityName: '天津市',
    },
    {
      市辖区: [
        {
          cityId: '120100',
          cityName: '市辖区',
        },
        {
          cityId: '120101',
          cityName: '和平区',
        },
        {
          cityId: '120102',
          cityName: '河东区',
        },
        {
          cityId: '120103',
          cityName: '河西区',
        },
        {
          cityId: '120104',
          cityName: '南开区',
        },
        {
          cityId: '120105',
          cityName: '河北区',
        },
        {
          cityId: '120106',
          cityName: '红桥区',
        },
        {
          cityId: '120110',
          cityName: '东丽区',
        },
        {
          cityId: '120111',
          cityName: '西青区',
        },
        {
          cityId: '120112',
          cityName: '津南区',
        },
        {
          cityId: '120113',
          cityName: '北辰区',
        },
        {
          cityId: '120114',
          cityName: '武清区',
        },
        {
          cityId: '120115',
          cityName: '宝坻区',
        },
        {
          cityId: '120116',
          cityName: '滨海新区',
        },
      ],
    },
    {
      县: [
        {
          cityId: '120200',
          cityName: '县',
        },
        {
          cityId: '120221',
          cityName: '宁河县',
        },
        {
          cityId: '120223',
          cityName: '静海县',
        },
        {
          cityId: '120225',
          cityName: '蓟　县',
        },
      ],
    },
  ],
  河北省: [
    {
      cityId: '130000',
      cityName: '河北省',
    },
    {
      石家庄市: [
        {
          cityId: '130100',
          cityName: '石家庄市',
        },
        {
          cityId: '130101',
          cityName: '市辖区',
        },
        {
          cityId: '130102',
          cityName: '长安区',
        },
        {
          cityId: '130103',
          cityName: '桥东区',
        },
        {
          cityId: '130104',
          cityName: '桥西区',
        },
        {
          cityId: '130105',
          cityName: '新华区',
        },
        {
          cityId: '130107',
          cityName: '井陉矿区',
        },
        {
          cityId: '130108',
          cityName: '裕华区',
        },
        {
          cityId: '130121',
          cityName: '井陉县',
        },
        {
          cityId: '130123',
          cityName: '正定县',
        },
        {
          cityId: '130124',
          cityName: '栾城县',
        },
        {
          cityId: '130125',
          cityName: '行唐县',
        },
        {
          cityId: '130126',
          cityName: '灵寿县',
        },
        {
          cityId: '130127',
          cityName: '高邑县',
        },
        {
          cityId: '130128',
          cityName: '深泽县',
        },
        {
          cityId: '130129',
          cityName: '赞皇县',
        },
        {
          cityId: '130130',
          cityName: '无极县',
        },
        {
          cityId: '130131',
          cityName: '平山县',
        },
        {
          cityId: '130132',
          cityName: '元氏县',
        },
        {
          cityId: '130133',
          cityName: '赵　县',
        },
        {
          cityId: '130181',
          cityName: '辛集市',
        },
        {
          cityId: '130182',
          cityName: '藁城市',
        },
        {
          cityId: '130183',
          cityName: '晋州市',
        },
        {
          cityId: '130184',
          cityName: '新乐市',
        },
        {
          cityId: '130185',
          cityName: '鹿泉市',
        },
      ],
    },
    {
      唐山市: [
        {
          cityId: '130200',
          cityName: '唐山市',
        },
        {
          cityId: '130201',
          cityName: '市辖区',
        },
        {
          cityId: '130202',
          cityName: '路南区',
        },
        {
          cityId: '130203',
          cityName: '路北区',
        },
        {
          cityId: '130204',
          cityName: '古冶区',
        },
        {
          cityId: '130205',
          cityName: '开平区',
        },
        {
          cityId: '130207',
          cityName: '丰南区',
        },
        {
          cityId: '130208',
          cityName: '丰润区',
        },
        {
          cityId: '130223',
          cityName: '滦　县',
        },
        {
          cityId: '130224',
          cityName: '滦南县',
        },
        {
          cityId: '130225',
          cityName: '乐亭县',
        },
        {
          cityId: '130227',
          cityName: '迁西县',
        },
        {
          cityId: '130229',
          cityName: '玉田县',
        },
        {
          cityId: '130230',
          cityName: '唐海县',
        },
        {
          cityId: '130281',
          cityName: '遵化市',
        },
        {
          cityId: '130283',
          cityName: '迁安市',
        },
      ],
    },
    {
      秦皇岛市: [
        {
          cityId: '130300',
          cityName: '秦皇岛市',
        },
        {
          cityId: '130301',
          cityName: '市辖区',
        },
        {
          cityId: '130302',
          cityName: '海港区',
        },
        {
          cityId: '130303',
          cityName: '山海关区',
        },
        {
          cityId: '130304',
          cityName: '北戴河区',
        },
        {
          cityId: '130321',
          cityName: '青龙满族自治县',
        },
        {
          cityId: '130322',
          cityName: '昌黎县',
        },
        {
          cityId: '130323',
          cityName: '抚宁县',
        },
        {
          cityId: '130324',
          cityName: '卢龙县',
        },
      ],
    },
    {
      邯郸市: [
        {
          cityId: '130400',
          cityName: '邯郸市',
        },
        {
          cityId: '130401',
          cityName: '市辖区',
        },
        {
          cityId: '130402',
          cityName: '邯山区',
        },
        {
          cityId: '130403',
          cityName: '丛台区',
        },
        {
          cityId: '130404',
          cityName: '复兴区',
        },
        {
          cityId: '130406',
          cityName: '峰峰矿区',
        },
        {
          cityId: '130421',
          cityName: '邯郸县',
        },
        {
          cityId: '130423',
          cityName: '临漳县',
        },
        {
          cityId: '130424',
          cityName: '成安县',
        },
        {
          cityId: '130425',
          cityName: '大名县',
        },
        {
          cityId: '130426',
          cityName: '涉　县',
        },
        {
          cityId: '130427',
          cityName: '磁　县',
        },
        {
          cityId: '130428',
          cityName: '肥乡县',
        },
        {
          cityId: '130429',
          cityName: '永年县',
        },
        {
          cityId: '130430',
          cityName: '邱　县',
        },
        {
          cityId: '130431',
          cityName: '鸡泽县',
        },
        {
          cityId: '130432',
          cityName: '广平县',
        },
        {
          cityId: '130433',
          cityName: '馆陶县',
        },
        {
          cityId: '130434',
          cityName: '魏　县',
        },
        {
          cityId: '130435',
          cityName: '曲周县',
        },
        {
          cityId: '130481',
          cityName: '武安市',
        },
      ],
    },
    {
      邢台市: [
        {
          cityId: '130500',
          cityName: '邢台市',
        },
        {
          cityId: '130501',
          cityName: '市辖区',
        },
        {
          cityId: '130502',
          cityName: '桥东区',
        },
        {
          cityId: '130503',
          cityName: '桥西区',
        },
        {
          cityId: '130521',
          cityName: '邢台县',
        },
        {
          cityId: '130522',
          cityName: '临城县',
        },
        {
          cityId: '130523',
          cityName: '内丘县',
        },
        {
          cityId: '130524',
          cityName: '柏乡县',
        },
        {
          cityId: '130525',
          cityName: '隆尧县',
        },
        {
          cityId: '130526',
          cityName: '任　县',
        },
        {
          cityId: '130527',
          cityName: '南和县',
        },
        {
          cityId: '130528',
          cityName: '宁晋县',
        },
        {
          cityId: '130529',
          cityName: '巨鹿县',
        },
        {
          cityId: '130530',
          cityName: '新河县',
        },
        {
          cityId: '130531',
          cityName: '广宗县',
        },
        {
          cityId: '130532',
          cityName: '平乡县',
        },
        {
          cityId: '130533',
          cityName: '威　县',
        },
        {
          cityId: '130534',
          cityName: '清河县',
        },
        {
          cityId: '130535',
          cityName: '临西县',
        },
        {
          cityId: '130581',
          cityName: '南宫市',
        },
        {
          cityId: '130582',
          cityName: '沙河市',
        },
      ],
    },
    {
      保定市: [
        {
          cityId: '130600',
          cityName: '保定市',
        },
        {
          cityId: '130601',
          cityName: '市辖区',
        },
        {
          cityId: '130602',
          cityName: '新市区',
        },
        {
          cityId: '130603',
          cityName: '北市区',
        },
        {
          cityId: '130604',
          cityName: '南市区',
        },
        {
          cityId: '130621',
          cityName: '满城县',
        },
        {
          cityId: '130622',
          cityName: '清苑县',
        },
        {
          cityId: '130623',
          cityName: '涞水县',
        },
        {
          cityId: '130624',
          cityName: '阜平县',
        },
        {
          cityId: '130625',
          cityName: '徐水县',
        },
        {
          cityId: '130626',
          cityName: '定兴县',
        },
        {
          cityId: '130627',
          cityName: '唐　县',
        },
        {
          cityId: '130628',
          cityName: '高阳县',
        },
        {
          cityId: '130629',
          cityName: '容城县',
        },
        {
          cityId: '130630',
          cityName: '涞源县',
        },
        {
          cityId: '130631',
          cityName: '望都县',
        },
        {
          cityId: '130632',
          cityName: '安新县',
        },
        {
          cityId: '130633',
          cityName: '易　县',
        },
        {
          cityId: '130634',
          cityName: '曲阳县',
        },
        {
          cityId: '130635',
          cityName: '蠡　县',
        },
        {
          cityId: '130636',
          cityName: '顺平县',
        },
        {
          cityId: '130637',
          cityName: '博野县',
        },
        {
          cityId: '130638',
          cityName: '雄　县',
        },
        {
          cityId: '130681',
          cityName: '涿州市',
        },
        {
          cityId: '130682',
          cityName: '定州市',
        },
        {
          cityId: '130683',
          cityName: '安国市',
        },
        {
          cityId: '130684',
          cityName: '高碑店市',
        },
      ],
    },
    {
      张家口市: [
        {
          cityId: '130700',
          cityName: '张家口市',
        },
        {
          cityId: '130701',
          cityName: '市辖区',
        },
        {
          cityId: '130702',
          cityName: '桥东区',
        },
        {
          cityId: '130703',
          cityName: '桥西区',
        },
        {
          cityId: '130705',
          cityName: '宣化区',
        },
        {
          cityId: '130706',
          cityName: '下花园区',
        },
        {
          cityId: '130721',
          cityName: '宣化县',
        },
        {
          cityId: '130722',
          cityName: '张北县',
        },
        {
          cityId: '130723',
          cityName: '康保县',
        },
        {
          cityId: '130724',
          cityName: '沽源县',
        },
        {
          cityId: '130725',
          cityName: '尚义县',
        },
        {
          cityId: '130726',
          cityName: '蔚　县',
        },
        {
          cityId: '130727',
          cityName: '阳原县',
        },
        {
          cityId: '130728',
          cityName: '怀安县',
        },
        {
          cityId: '130729',
          cityName: '万全县',
        },
        {
          cityId: '130730',
          cityName: '怀来县',
        },
        {
          cityId: '130731',
          cityName: '涿鹿县',
        },
        {
          cityId: '130732',
          cityName: '赤城县',
        },
        {
          cityId: '130733',
          cityName: '崇礼县',
        },
      ],
    },
    {
      承德市: [
        {
          cityId: '130800',
          cityName: '承德市',
        },
        {
          cityId: '130801',
          cityName: '市辖区',
        },
        {
          cityId: '130802',
          cityName: '双桥区',
        },
        {
          cityId: '130803',
          cityName: '双滦区',
        },
        {
          cityId: '130804',
          cityName: '鹰手营子矿区',
        },
        {
          cityId: '130821',
          cityName: '承德县',
        },
        {
          cityId: '130822',
          cityName: '兴隆县',
        },
        {
          cityId: '130823',
          cityName: '平泉县',
        },
        {
          cityId: '130824',
          cityName: '滦平县',
        },
        {
          cityId: '130825',
          cityName: '隆化县',
        },
        {
          cityId: '130826',
          cityName: '丰宁满族自治县',
        },
        {
          cityId: '130827',
          cityName: '宽城满族自治县',
        },
        {
          cityId: '130828',
          cityName: '围场满族蒙古族自治县',
        },
      ],
    },
    {
      沧州市: [
        {
          cityId: '130900',
          cityName: '沧州市',
        },
        {
          cityId: '130901',
          cityName: '市辖区',
        },
        {
          cityId: '130902',
          cityName: '新华区',
        },
        {
          cityId: '130903',
          cityName: '运河区',
        },
        {
          cityId: '130921',
          cityName: '沧　县',
        },
        {
          cityId: '130922',
          cityName: '青　县',
        },
        {
          cityId: '130923',
          cityName: '东光县',
        },
        {
          cityId: '130924',
          cityName: '海兴县',
        },
        {
          cityId: '130925',
          cityName: '盐山县',
        },
        {
          cityId: '130926',
          cityName: '肃宁县',
        },
        {
          cityId: '130927',
          cityName: '南皮县',
        },
        {
          cityId: '130928',
          cityName: '吴桥县',
        },
        {
          cityId: '130929',
          cityName: '献　县',
        },
        {
          cityId: '130930',
          cityName: '孟村回族自治县',
        },
        {
          cityId: '130981',
          cityName: '泊头市',
        },
        {
          cityId: '130982',
          cityName: '任丘市',
        },
        {
          cityId: '130983',
          cityName: '黄骅市',
        },
        {
          cityId: '130984',
          cityName: '河间市',
        },
      ],
    },
    {
      廊坊市: [
        {
          cityId: '131000',
          cityName: '廊坊市',
        },
        {
          cityId: '131001',
          cityName: '市辖区',
        },
        {
          cityId: '131002',
          cityName: '安次区',
        },
        {
          cityId: '131003',
          cityName: '广阳区',
        },
        {
          cityId: '131022',
          cityName: '固安县',
        },
        {
          cityId: '131023',
          cityName: '永清县',
        },
        {
          cityId: '131024',
          cityName: '香河县',
        },
        {
          cityId: '131025',
          cityName: '大城县',
        },
        {
          cityId: '131026',
          cityName: '文安县',
        },
        {
          cityId: '131028',
          cityName: '大厂回族自治县',
        },
        {
          cityId: '131081',
          cityName: '霸州市',
        },
        {
          cityId: '131082',
          cityName: '三河市',
        },
      ],
    },
    {
      衡水市: [
        {
          cityId: '131100',
          cityName: '衡水市',
        },
        {
          cityId: '131101',
          cityName: '市辖区',
        },
        {
          cityId: '131102',
          cityName: '桃城区',
        },
        {
          cityId: '131121',
          cityName: '枣强县',
        },
        {
          cityId: '131122',
          cityName: '武邑县',
        },
        {
          cityId: '131123',
          cityName: '武强县',
        },
        {
          cityId: '131124',
          cityName: '饶阳县',
        },
        {
          cityId: '131125',
          cityName: '安平县',
        },
        {
          cityId: '131126',
          cityName: '故城县',
        },
        {
          cityId: '131127',
          cityName: '景　县',
        },
        {
          cityId: '131128',
          cityName: '阜城县',
        },
        {
          cityId: '131181',
          cityName: '冀州市',
        },
        {
          cityId: '131182',
          cityName: '深州市',
        },
      ],
    },
  ],
  山西省: [
    {
      cityId: '140000',
      cityName: '山西省',
    },
    {
      太原市: [
        {
          cityId: '140100',
          cityName: '太原市',
        },
        {
          cityId: '140101',
          cityName: '市辖区',
        },
        {
          cityId: '140105',
          cityName: '小店区',
        },
        {
          cityId: '140106',
          cityName: '迎泽区',
        },
        {
          cityId: '140107',
          cityName: '杏花岭区',
        },
        {
          cityId: '140108',
          cityName: '尖草坪区',
        },
        {
          cityId: '140109',
          cityName: '万柏林区',
        },
        {
          cityId: '140110',
          cityName: '晋源区',
        },
        {
          cityId: '140121',
          cityName: '清徐县',
        },
        {
          cityId: '140122',
          cityName: '阳曲县',
        },
        {
          cityId: '140123',
          cityName: '娄烦县',
        },
        {
          cityId: '140181',
          cityName: '古交市',
        },
      ],
    },
    {
      大同市: [
        {
          cityId: '140200',
          cityName: '大同市',
        },
        {
          cityId: '140201',
          cityName: '市辖区',
        },
        {
          cityId: '140202',
          cityName: '城　区',
        },
        {
          cityId: '140203',
          cityName: '矿　区',
        },
        {
          cityId: '140211',
          cityName: '南郊区',
        },
        {
          cityId: '140212',
          cityName: '新荣区',
        },
        {
          cityId: '140221',
          cityName: '阳高县',
        },
        {
          cityId: '140222',
          cityName: '天镇县',
        },
        {
          cityId: '140223',
          cityName: '广灵县',
        },
        {
          cityId: '140224',
          cityName: '灵丘县',
        },
        {
          cityId: '140225',
          cityName: '浑源县',
        },
        {
          cityId: '140226',
          cityName: '左云县',
        },
        {
          cityId: '140227',
          cityName: '大同县',
        },
      ],
    },
    {
      阳泉市: [
        {
          cityId: '140300',
          cityName: '阳泉市',
        },
        {
          cityId: '140301',
          cityName: '市辖区',
        },
        {
          cityId: '140302',
          cityName: '城　区',
        },
        {
          cityId: '140303',
          cityName: '矿　区',
        },
        {
          cityId: '140311',
          cityName: '郊　区',
        },
        {
          cityId: '140321',
          cityName: '平定县',
        },
        {
          cityId: '140322',
          cityName: '盂　县',
        },
      ],
    },
    {
      长治市: [
        {
          cityId: '140400',
          cityName: '长治市',
        },
        {
          cityId: '140401',
          cityName: '市辖区',
        },
        {
          cityId: '140402',
          cityName: '城　区',
        },
        {
          cityId: '140411',
          cityName: '郊　区',
        },
        {
          cityId: '140421',
          cityName: '长治县',
        },
        {
          cityId: '140423',
          cityName: '襄垣县',
        },
        {
          cityId: '140424',
          cityName: '屯留县',
        },
        {
          cityId: '140425',
          cityName: '平顺县',
        },
        {
          cityId: '140426',
          cityName: '黎城县',
        },
        {
          cityId: '140427',
          cityName: '壶关县',
        },
        {
          cityId: '140428',
          cityName: '长子县',
        },
        {
          cityId: '140429',
          cityName: '武乡县',
        },
        {
          cityId: '140430',
          cityName: '沁　县',
        },
        {
          cityId: '140431',
          cityName: '沁源县',
        },
        {
          cityId: '140481',
          cityName: '潞城市',
        },
      ],
    },
    {
      晋城市: [
        {
          cityId: '140500',
          cityName: '晋城市',
        },
        {
          cityId: '140501',
          cityName: '市辖区',
        },
        {
          cityId: '140502',
          cityName: '城　区',
        },
        {
          cityId: '140521',
          cityName: '沁水县',
        },
        {
          cityId: '140522',
          cityName: '阳城县',
        },
        {
          cityId: '140524',
          cityName: '陵川县',
        },
        {
          cityId: '140525',
          cityName: '泽州县',
        },
        {
          cityId: '140581',
          cityName: '高平市',
        },
      ],
    },
    {
      朔州市: [
        {
          cityId: '140600',
          cityName: '朔州市',
        },
        {
          cityId: '140601',
          cityName: '市辖区',
        },
        {
          cityId: '140602',
          cityName: '朔城区',
        },
        {
          cityId: '140603',
          cityName: '平鲁区',
        },
        {
          cityId: '140621',
          cityName: '山阴县',
        },
        {
          cityId: '140622',
          cityName: '应　县',
        },
        {
          cityId: '140623',
          cityName: '右玉县',
        },
        {
          cityId: '140624',
          cityName: '怀仁县',
        },
      ],
    },
    {
      晋中市: [
        {
          cityId: '140700',
          cityName: '晋中市',
        },
        {
          cityId: '140701',
          cityName: '市辖区',
        },
        {
          cityId: '140702',
          cityName: '榆次区',
        },
        {
          cityId: '140721',
          cityName: '榆社县',
        },
        {
          cityId: '140722',
          cityName: '左权县',
        },
        {
          cityId: '140723',
          cityName: '和顺县',
        },
        {
          cityId: '140724',
          cityName: '昔阳县',
        },
        {
          cityId: '140725',
          cityName: '寿阳县',
        },
        {
          cityId: '140726',
          cityName: '太谷县',
        },
        {
          cityId: '140727',
          cityName: '祁　县',
        },
        {
          cityId: '140728',
          cityName: '平遥县',
        },
        {
          cityId: '140729',
          cityName: '灵石县',
        },
        {
          cityId: '140781',
          cityName: '介休市',
        },
      ],
    },
    {
      运城市: [
        {
          cityId: '140800',
          cityName: '运城市',
        },
        {
          cityId: '140801',
          cityName: '市辖区',
        },
        {
          cityId: '140802',
          cityName: '盐湖区',
        },
        {
          cityId: '140821',
          cityName: '临猗县',
        },
        {
          cityId: '140822',
          cityName: '万荣县',
        },
        {
          cityId: '140823',
          cityName: '闻喜县',
        },
        {
          cityId: '140824',
          cityName: '稷山县',
        },
        {
          cityId: '140825',
          cityName: '新绛县',
        },
        {
          cityId: '140826',
          cityName: '绛　县',
        },
        {
          cityId: '140827',
          cityName: '垣曲县',
        },
        {
          cityId: '140828',
          cityName: '夏　县',
        },
        {
          cityId: '140829',
          cityName: '平陆县',
        },
        {
          cityId: '140830',
          cityName: '芮城县',
        },
        {
          cityId: '140881',
          cityName: '永济市',
        },
        {
          cityId: '140882',
          cityName: '河津市',
        },
      ],
    },
    {
      忻州市: [
        {
          cityId: '140900',
          cityName: '忻州市',
        },
        {
          cityId: '140901',
          cityName: '市辖区',
        },
        {
          cityId: '140902',
          cityName: '忻府区',
        },
        {
          cityId: '140921',
          cityName: '定襄县',
        },
        {
          cityId: '140922',
          cityName: '五台县',
        },
        {
          cityId: '140923',
          cityName: '代　县',
        },
        {
          cityId: '140924',
          cityName: '繁峙县',
        },
        {
          cityId: '140925',
          cityName: '宁武县',
        },
        {
          cityId: '140926',
          cityName: '静乐县',
        },
        {
          cityId: '140927',
          cityName: '神池县',
        },
        {
          cityId: '140928',
          cityName: '五寨县',
        },
        {
          cityId: '140929',
          cityName: '岢岚县',
        },
        {
          cityId: '140930',
          cityName: '河曲县',
        },
        {
          cityId: '140931',
          cityName: '保德县',
        },
        {
          cityId: '140932',
          cityName: '偏关县',
        },
        {
          cityId: '140981',
          cityName: '原平市',
        },
      ],
    },
    {
      临汾市: [
        {
          cityId: '141000',
          cityName: '临汾市',
        },
        {
          cityId: '141001',
          cityName: '市辖区',
        },
        {
          cityId: '141002',
          cityName: '尧都区',
        },
        {
          cityId: '141021',
          cityName: '曲沃县',
        },
        {
          cityId: '141022',
          cityName: '翼城县',
        },
        {
          cityId: '141023',
          cityName: '襄汾县',
        },
        {
          cityId: '141024',
          cityName: '洪洞县',
        },
        {
          cityId: '141025',
          cityName: '古　县',
        },
        {
          cityId: '141026',
          cityName: '安泽县',
        },
        {
          cityId: '141027',
          cityName: '浮山县',
        },
        {
          cityId: '141028',
          cityName: '吉　县',
        },
        {
          cityId: '141029',
          cityName: '乡宁县',
        },
        {
          cityId: '141030',
          cityName: '大宁县',
        },
        {
          cityId: '141031',
          cityName: '隰　县',
        },
        {
          cityId: '141032',
          cityName: '永和县',
        },
        {
          cityId: '141033',
          cityName: '蒲　县',
        },
        {
          cityId: '141034',
          cityName: '汾西县',
        },
        {
          cityId: '141081',
          cityName: '侯马市',
        },
        {
          cityId: '141082',
          cityName: '霍州市',
        },
      ],
    },
    {
      吕梁市: [
        {
          cityId: '141100',
          cityName: '吕梁市',
        },
        {
          cityId: '141101',
          cityName: '市辖区',
        },
        {
          cityId: '141102',
          cityName: '离石区',
        },
        {
          cityId: '141121',
          cityName: '文水县',
        },
        {
          cityId: '141122',
          cityName: '交城县',
        },
        {
          cityId: '141123',
          cityName: '兴　县',
        },
        {
          cityId: '141124',
          cityName: '临　县',
        },
        {
          cityId: '141125',
          cityName: '柳林县',
        },
        {
          cityId: '141126',
          cityName: '石楼县',
        },
        {
          cityId: '141127',
          cityName: '岚　县',
        },
        {
          cityId: '141128',
          cityName: '方山县',
        },
        {
          cityId: '141129',
          cityName: '中阳县',
        },
        {
          cityId: '141130',
          cityName: '交口县',
        },
        {
          cityId: '141181',
          cityName: '孝义市',
        },
        {
          cityId: '141182',
          cityName: '汾阳市',
        },
      ],
    },
  ],
  内蒙古自治区: [
    {
      cityId: '150000',
      cityName: '内蒙古自治区',
    },
    {
      呼和浩特市: [
        {
          cityId: '150100',
          cityName: '呼和浩特市',
        },
        {
          cityId: '150101',
          cityName: '市辖区',
        },
        {
          cityId: '150102',
          cityName: '新城区',
        },
        {
          cityId: '150103',
          cityName: '回民区',
        },
        {
          cityId: '150104',
          cityName: '玉泉区',
        },
        {
          cityId: '150105',
          cityName: '赛罕区',
        },
        {
          cityId: '150121',
          cityName: '土默特左旗',
        },
        {
          cityId: '150122',
          cityName: '托克托县',
        },
        {
          cityId: '150123',
          cityName: '和林格尔县',
        },
        {
          cityId: '150124',
          cityName: '清水河县',
        },
        {
          cityId: '150125',
          cityName: '武川县',
        },
      ],
    },
    {
      包头市: [
        {
          cityId: '150200',
          cityName: '包头市',
        },
        {
          cityId: '150201',
          cityName: '市辖区',
        },
        {
          cityId: '150202',
          cityName: '东河区',
        },
        {
          cityId: '150203',
          cityName: '昆都仑区',
        },
        {
          cityId: '150204',
          cityName: '青山区',
        },
        {
          cityId: '150205',
          cityName: '石拐区',
        },
        {
          cityId: '150206',
          cityName: '白云鄂博矿区',
        },
        {
          cityId: '150207',
          cityName: '九原区',
        },
        {
          cityId: '150221',
          cityName: '土默特右旗',
        },
        {
          cityId: '150222',
          cityName: '固阳县',
        },
        {
          cityId: '150223',
          cityName: '达尔罕茂明安联合旗',
        },
      ],
    },
    {
      乌海市: [
        {
          cityId: '150300',
          cityName: '乌海市',
        },
        {
          cityId: '150301',
          cityName: '市辖区',
        },
        {
          cityId: '150302',
          cityName: '海勃湾区',
        },
        {
          cityId: '150303',
          cityName: '海南区',
        },
        {
          cityId: '150304',
          cityName: '乌达区',
        },
      ],
    },
    {
      赤峰市: [
        {
          cityId: '150400',
          cityName: '赤峰市',
        },
        {
          cityId: '150401',
          cityName: '市辖区',
        },
        {
          cityId: '150402',
          cityName: '红山区',
        },
        {
          cityId: '150403',
          cityName: '元宝山区',
        },
        {
          cityId: '150404',
          cityName: '松山区',
        },
        {
          cityId: '150421',
          cityName: '阿鲁科尔沁旗',
        },
        {
          cityId: '150422',
          cityName: '巴林左旗',
        },
        {
          cityId: '150423',
          cityName: '巴林右旗',
        },
        {
          cityId: '150424',
          cityName: '林西县',
        },
        {
          cityId: '150425',
          cityName: '克什克腾旗',
        },
        {
          cityId: '150426',
          cityName: '翁牛特旗',
        },
        {
          cityId: '150428',
          cityName: '喀喇沁旗',
        },
        {
          cityId: '150429',
          cityName: '宁城县',
        },
        {
          cityId: '150430',
          cityName: '敖汉旗',
        },
      ],
    },
    {
      通辽市: [
        {
          cityId: '150500',
          cityName: '通辽市',
        },
        {
          cityId: '150501',
          cityName: '市辖区',
        },
        {
          cityId: '150502',
          cityName: '科尔沁区',
        },
        {
          cityId: '150521',
          cityName: '科尔沁左翼中旗',
        },
        {
          cityId: '150522',
          cityName: '科尔沁左翼后旗',
        },
        {
          cityId: '150523',
          cityName: '开鲁县',
        },
        {
          cityId: '150524',
          cityName: '库伦旗',
        },
        {
          cityId: '150525',
          cityName: '奈曼旗',
        },
        {
          cityId: '150526',
          cityName: '扎鲁特旗',
        },
        {
          cityId: '150581',
          cityName: '霍林郭勒市',
        },
      ],
    },
    {
      鄂尔多斯市: [
        {
          cityId: '150600',
          cityName: '鄂尔多斯市',
        },
        {
          cityId: '150601',
          cityName: '市辖区',
        },
        {
          cityId: '150602',
          cityName: '东胜区',
        },
        {
          cityId: '150621',
          cityName: '达拉特旗',
        },
        {
          cityId: '150622',
          cityName: '准格尔旗',
        },
        {
          cityId: '150623',
          cityName: '鄂托克前旗',
        },
        {
          cityId: '150624',
          cityName: '鄂托克旗',
        },
        {
          cityId: '150625',
          cityName: '杭锦旗',
        },
        {
          cityId: '150626',
          cityName: '乌审旗',
        },
        {
          cityId: '150627',
          cityName: '伊金霍洛旗',
        },
      ],
    },
    {
      呼伦贝尔市: [
        {
          cityId: '150700',
          cityName: '呼伦贝尔市',
        },
        {
          cityId: '150701',
          cityName: '市辖区',
        },
        {
          cityId: '150702',
          cityName: '海拉尔区',
        },
        {
          cityId: '150721',
          cityName: '阿荣旗',
        },
        {
          cityId: '150722',
          cityName: '莫力达瓦达斡尔族自治旗',
        },
        {
          cityId: '150723',
          cityName: '鄂伦春自治旗',
        },
        {
          cityId: '150724',
          cityName: '鄂温克族自治旗',
        },
        {
          cityId: '150725',
          cityName: '陈巴尔虎旗',
        },
        {
          cityId: '150726',
          cityName: '新巴尔虎左旗',
        },
        {
          cityId: '150727',
          cityName: '新巴尔虎右旗',
        },
        {
          cityId: '150781',
          cityName: '满洲里市',
        },
        {
          cityId: '150782',
          cityName: '牙克石市',
        },
        {
          cityId: '150783',
          cityName: '扎兰屯市',
        },
        {
          cityId: '150784',
          cityName: '额尔古纳市',
        },
        {
          cityId: '150785',
          cityName: '根河市',
        },
      ],
    },
    {
      巴彦淖尔市: [
        {
          cityId: '150800',
          cityName: '巴彦淖尔市',
        },
        {
          cityId: '150801',
          cityName: '市辖区',
        },
        {
          cityId: '150802',
          cityName: '临河区',
        },
        {
          cityId: '150821',
          cityName: '五原县',
        },
        {
          cityId: '150822',
          cityName: '磴口县',
        },
        {
          cityId: '150823',
          cityName: '乌拉特前旗',
        },
        {
          cityId: '150824',
          cityName: '乌拉特中旗',
        },
        {
          cityId: '150825',
          cityName: '乌拉特后旗',
        },
        {
          cityId: '150826',
          cityName: '杭锦后旗',
        },
      ],
    },
    {
      乌兰察布市: [
        {
          cityId: '150900',
          cityName: '乌兰察布市',
        },
        {
          cityId: '150901',
          cityName: '市辖区',
        },
        {
          cityId: '150902',
          cityName: '集宁区',
        },
        {
          cityId: '150921',
          cityName: '卓资县',
        },
        {
          cityId: '150922',
          cityName: '化德县',
        },
        {
          cityId: '150923',
          cityName: '商都县',
        },
        {
          cityId: '150924',
          cityName: '兴和县',
        },
        {
          cityId: '150925',
          cityName: '凉城县',
        },
        {
          cityId: '150926',
          cityName: '察哈尔右翼前旗',
        },
        {
          cityId: '150927',
          cityName: '察哈尔右翼中旗',
        },
        {
          cityId: '150928',
          cityName: '察哈尔右翼后旗',
        },
        {
          cityId: '150929',
          cityName: '四子王旗',
        },
        {
          cityId: '150981',
          cityName: '丰镇市',
        },
      ],
    },
    {
      兴安盟: [
        {
          cityId: '152200',
          cityName: '兴安盟',
        },
        {
          cityId: '152201',
          cityName: '乌兰浩特市',
        },
        {
          cityId: '152202',
          cityName: '阿尔山市',
        },
        {
          cityId: '152221',
          cityName: '科尔沁右翼前旗',
        },
        {
          cityId: '152222',
          cityName: '科尔沁右翼中旗',
        },
        {
          cityId: '152223',
          cityName: '扎赉特旗',
        },
        {
          cityId: '152224',
          cityName: '突泉县',
        },
      ],
    },
    {
      锡林郭勒盟: [
        {
          cityId: '152500',
          cityName: '锡林郭勒盟',
        },
        {
          cityId: '152501',
          cityName: '二连浩特市',
        },
        {
          cityId: '152502',
          cityName: '锡林浩特市',
        },
        {
          cityId: '152522',
          cityName: '阿巴嘎旗',
        },
        {
          cityId: '152523',
          cityName: '苏尼特左旗',
        },
        {
          cityId: '152524',
          cityName: '苏尼特右旗',
        },
        {
          cityId: '152525',
          cityName: '东乌珠穆沁旗',
        },
        {
          cityId: '152526',
          cityName: '西乌珠穆沁旗',
        },
        {
          cityId: '152527',
          cityName: '太仆寺旗',
        },
        {
          cityId: '152528',
          cityName: '镶黄旗',
        },
        {
          cityId: '152529',
          cityName: '正镶白旗',
        },
        {
          cityId: '152530',
          cityName: '正蓝旗',
        },
        {
          cityId: '152531',
          cityName: '多伦县',
        },
      ],
    },
    {
      阿拉善盟: [
        {
          cityId: '152900',
          cityName: '阿拉善盟',
        },
        {
          cityId: '152921',
          cityName: '阿拉善左旗',
        },
        {
          cityId: '152922',
          cityName: '阿拉善右旗',
        },
        {
          cityId: '152923',
          cityName: '额济纳旗',
        },
      ],
    },
  ],
  辽宁省: [
    {
      cityId: '210000',
      cityName: '辽宁省',
    },
    {
      沈阳市: [
        {
          cityId: '210100',
          cityName: '沈阳市',
        },
        {
          cityId: '210101',
          cityName: '市辖区',
        },
        {
          cityId: '210102',
          cityName: '和平区',
        },
        {
          cityId: '210103',
          cityName: '沈河区',
        },
        {
          cityId: '210104',
          cityName: '大东区',
        },
        {
          cityId: '210105',
          cityName: '皇姑区',
        },
        {
          cityId: '210106',
          cityName: '铁西区',
        },
        {
          cityId: '210111',
          cityName: '苏家屯区',
        },
        {
          cityId: '210112',
          cityName: '东陵区',
        },
        {
          cityId: '210113',
          cityName: '沈北新区',
        },
        {
          cityId: '210114',
          cityName: '于洪区',
        },
        {
          cityId: '210122',
          cityName: '辽中县',
        },
        {
          cityId: '210123',
          cityName: '康平县',
        },
        {
          cityId: '210124',
          cityName: '法库县',
        },
        {
          cityId: '210181',
          cityName: '新民市',
        },
      ],
    },
    {
      大连市: [
        {
          cityId: '210200',
          cityName: '大连市',
        },
        {
          cityId: '210201',
          cityName: '市辖区',
        },
        {
          cityId: '210202',
          cityName: '中山区',
        },
        {
          cityId: '210203',
          cityName: '西岗区',
        },
        {
          cityId: '210204',
          cityName: '沙河口区',
        },
        {
          cityId: '210211',
          cityName: '甘井子区',
        },
        {
          cityId: '210212',
          cityName: '旅顺口区',
        },
        {
          cityId: '210213',
          cityName: '金州区',
        },
        {
          cityId: '210224',
          cityName: '长海县',
        },
        {
          cityId: '210281',
          cityName: '瓦房店市',
        },
        {
          cityId: '210282',
          cityName: '普兰店市',
        },
        {
          cityId: '210283',
          cityName: '庄河市',
        },
      ],
    },
    {
      鞍山市: [
        {
          cityId: '210300',
          cityName: '鞍山市',
        },
        {
          cityId: '210301',
          cityName: '市辖区',
        },
        {
          cityId: '210302',
          cityName: '铁东区',
        },
        {
          cityId: '210303',
          cityName: '铁西区',
        },
        {
          cityId: '210304',
          cityName: '立山区',
        },
        {
          cityId: '210311',
          cityName: '千山区',
        },
        {
          cityId: '210321',
          cityName: '台安县',
        },
        {
          cityId: '210323',
          cityName: '岫岩满族自治县',
        },
        {
          cityId: '210381',
          cityName: '海城市',
        },
      ],
    },
    {
      抚顺市: [
        {
          cityId: '210400',
          cityName: '抚顺市',
        },
        {
          cityId: '210401',
          cityName: '市辖区',
        },
        {
          cityId: '210402',
          cityName: '新抚区',
        },
        {
          cityId: '210403',
          cityName: '东洲区',
        },
        {
          cityId: '210404',
          cityName: '望花区',
        },
        {
          cityId: '210411',
          cityName: '顺城区',
        },
        {
          cityId: '210421',
          cityName: '抚顺县',
        },
        {
          cityId: '210422',
          cityName: '新宾满族自治县',
        },
        {
          cityId: '210423',
          cityName: '清原满族自治县',
        },
      ],
    },
    {
      本溪市: [
        {
          cityId: '210500',
          cityName: '本溪市',
        },
        {
          cityId: '210501',
          cityName: '市辖区',
        },
        {
          cityId: '210502',
          cityName: '平山区',
        },
        {
          cityId: '210503',
          cityName: '溪湖区',
        },
        {
          cityId: '210504',
          cityName: '明山区',
        },
        {
          cityId: '210505',
          cityName: '南芬区',
        },
        {
          cityId: '210521',
          cityName: '本溪满族自治县',
        },
        {
          cityId: '210522',
          cityName: '桓仁满族自治县',
        },
      ],
    },
    {
      丹东市: [
        {
          cityId: '210600',
          cityName: '丹东市',
        },
        {
          cityId: '210601',
          cityName: '市辖区',
        },
        {
          cityId: '210602',
          cityName: '元宝区',
        },
        {
          cityId: '210603',
          cityName: '振兴区',
        },
        {
          cityId: '210604',
          cityName: '振安区',
        },
        {
          cityId: '210624',
          cityName: '宽甸满族自治县',
        },
        {
          cityId: '210681',
          cityName: '东港市',
        },
        {
          cityId: '210682',
          cityName: '凤城市',
        },
      ],
    },
    {
      锦州市: [
        {
          cityId: '210700',
          cityName: '锦州市',
        },
        {
          cityId: '210701',
          cityName: '市辖区',
        },
        {
          cityId: '210702',
          cityName: '古塔区',
        },
        {
          cityId: '210703',
          cityName: '凌河区',
        },
        {
          cityId: '210711',
          cityName: '太和区',
        },
        {
          cityId: '210726',
          cityName: '黑山县',
        },
        {
          cityId: '210727',
          cityName: '义　县',
        },
        {
          cityId: '210781',
          cityName: '凌海市',
        },
        {
          cityId: '210782',
          cityName: '北镇市',
        },
      ],
    },
    {
      营口市: [
        {
          cityId: '210800',
          cityName: '营口市',
        },
        {
          cityId: '210801',
          cityName: '市辖区',
        },
        {
          cityId: '210802',
          cityName: '站前区',
        },
        {
          cityId: '210803',
          cityName: '西市区',
        },
        {
          cityId: '210804',
          cityName: '鲅鱼圈区',
        },
        {
          cityId: '210811',
          cityName: '老边区',
        },
        {
          cityId: '210881',
          cityName: '盖州市',
        },
        {
          cityId: '210882',
          cityName: '大石桥市',
        },
      ],
    },
    {
      阜新市: [
        {
          cityId: '210900',
          cityName: '阜新市',
        },
        {
          cityId: '210901',
          cityName: '市辖区',
        },
        {
          cityId: '210902',
          cityName: '海州区',
        },
        {
          cityId: '210903',
          cityName: '新邱区',
        },
        {
          cityId: '210904',
          cityName: '太平区',
        },
        {
          cityId: '210905',
          cityName: '清河门区',
        },
        {
          cityId: '210911',
          cityName: '细河区',
        },
        {
          cityId: '210921',
          cityName: '阜新蒙古族自治县',
        },
        {
          cityId: '210922',
          cityName: '彰武县',
        },
      ],
    },
    {
      辽阳市: [
        {
          cityId: '211000',
          cityName: '辽阳市',
        },
        {
          cityId: '211001',
          cityName: '市辖区',
        },
        {
          cityId: '211002',
          cityName: '白塔区',
        },
        {
          cityId: '211003',
          cityName: '文圣区',
        },
        {
          cityId: '211004',
          cityName: '宏伟区',
        },
        {
          cityId: '211005',
          cityName: '弓长岭区',
        },
        {
          cityId: '211011',
          cityName: '太子河区',
        },
        {
          cityId: '211021',
          cityName: '辽阳县',
        },
        {
          cityId: '211081',
          cityName: '灯塔市',
        },
      ],
    },
    {
      盘锦市: [
        {
          cityId: '211100',
          cityName: '盘锦市',
        },
        {
          cityId: '211101',
          cityName: '市辖区',
        },
        {
          cityId: '211102',
          cityName: '双台子区',
        },
        {
          cityId: '211103',
          cityName: '兴隆台区',
        },
        {
          cityId: '211121',
          cityName: '大洼县',
        },
        {
          cityId: '211122',
          cityName: '盘山县',
        },
      ],
    },
    {
      铁岭市: [
        {
          cityId: '211200',
          cityName: '铁岭市',
        },
        {
          cityId: '211201',
          cityName: '市辖区',
        },
        {
          cityId: '211202',
          cityName: '银州区',
        },
        {
          cityId: '211204',
          cityName: '清河区',
        },
        {
          cityId: '211221',
          cityName: '铁岭县',
        },
        {
          cityId: '211223',
          cityName: '西丰县',
        },
        {
          cityId: '211224',
          cityName: '昌图县',
        },
        {
          cityId: '211281',
          cityName: '调兵山市',
        },
        {
          cityId: '211282',
          cityName: '开原市',
        },
      ],
    },
    {
      朝阳市: [
        {
          cityId: '211300',
          cityName: '朝阳市',
        },
        {
          cityId: '211301',
          cityName: '市辖区',
        },
        {
          cityId: '211302',
          cityName: '双塔区',
        },
        {
          cityId: '211303',
          cityName: '龙城区',
        },
        {
          cityId: '211321',
          cityName: '朝阳县',
        },
        {
          cityId: '211322',
          cityName: '建平县',
        },
        {
          cityId: '211324',
          cityName: '喀喇沁左翼蒙古族自治县',
        },
        {
          cityId: '211381',
          cityName: '北票市',
        },
        {
          cityId: '211382',
          cityName: '凌源市',
        },
      ],
    },
    {
      葫芦岛市: [
        {
          cityId: '211400',
          cityName: '葫芦岛市',
        },
        {
          cityId: '211401',
          cityName: '市辖区',
        },
        {
          cityId: '211402',
          cityName: '连山区',
        },
        {
          cityId: '211403',
          cityName: '龙港区',
        },
        {
          cityId: '211404',
          cityName: '南票区',
        },
        {
          cityId: '211421',
          cityName: '绥中县',
        },
        {
          cityId: '211422',
          cityName: '建昌县',
        },
        {
          cityId: '211481',
          cityName: '兴城市',
        },
      ],
    },
  ],
  吉林省: [
    {
      cityId: '220000',
      cityName: '吉林省',
    },
    {
      长春市: [
        {
          cityId: '220100',
          cityName: '长春市',
        },
        {
          cityId: '220101',
          cityName: '市辖区',
        },
        {
          cityId: '220102',
          cityName: '南关区',
        },
        {
          cityId: '220103',
          cityName: '宽城区',
        },
        {
          cityId: '220104',
          cityName: '朝阳区',
        },
        {
          cityId: '220105',
          cityName: '二道区',
        },
        {
          cityId: '220106',
          cityName: '绿园区',
        },
        {
          cityId: '220112',
          cityName: '双阳区',
        },
        {
          cityId: '220122',
          cityName: '农安县',
        },
        {
          cityId: '220181',
          cityName: '九台市',
        },
        {
          cityId: '220182',
          cityName: '榆树市',
        },
        {
          cityId: '220183',
          cityName: '德惠市',
        },
      ],
    },
    {
      吉林市: [
        {
          cityId: '220200',
          cityName: '吉林市',
        },
        {
          cityId: '220201',
          cityName: '市辖区',
        },
        {
          cityId: '220202',
          cityName: '昌邑区',
        },
        {
          cityId: '220203',
          cityName: '龙潭区',
        },
        {
          cityId: '220204',
          cityName: '船营区',
        },
        {
          cityId: '220211',
          cityName: '丰满区',
        },
        {
          cityId: '220221',
          cityName: '永吉县',
        },
        {
          cityId: '220281',
          cityName: '蛟河市',
        },
        {
          cityId: '220282',
          cityName: '桦甸市',
        },
        {
          cityId: '220283',
          cityName: '舒兰市',
        },
        {
          cityId: '220284',
          cityName: '磐石市',
        },
      ],
    },
    {
      四平市: [
        {
          cityId: '220300',
          cityName: '四平市',
        },
        {
          cityId: '220301',
          cityName: '市辖区',
        },
        {
          cityId: '220302',
          cityName: '铁西区',
        },
        {
          cityId: '220303',
          cityName: '铁东区',
        },
        {
          cityId: '220322',
          cityName: '梨树县',
        },
        {
          cityId: '220323',
          cityName: '伊通满族自治县',
        },
        {
          cityId: '220381',
          cityName: '公主岭市',
        },
        {
          cityId: '220382',
          cityName: '双辽市',
        },
      ],
    },
    {
      辽源市: [
        {
          cityId: '220400',
          cityName: '辽源市',
        },
        {
          cityId: '220401',
          cityName: '市辖区',
        },
        {
          cityId: '220402',
          cityName: '龙山区',
        },
        {
          cityId: '220403',
          cityName: '西安区',
        },
        {
          cityId: '220421',
          cityName: '东丰县',
        },
        {
          cityId: '220422',
          cityName: '东辽县',
        },
      ],
    },
    {
      通化市: [
        {
          cityId: '220500',
          cityName: '通化市',
        },
        {
          cityId: '220501',
          cityName: '市辖区',
        },
        {
          cityId: '220502',
          cityName: '东昌区',
        },
        {
          cityId: '220503',
          cityName: '二道江区',
        },
        {
          cityId: '220521',
          cityName: '通化县',
        },
        {
          cityId: '220523',
          cityName: '辉南县',
        },
        {
          cityId: '220524',
          cityName: '柳河县',
        },
        {
          cityId: '220581',
          cityName: '梅河口市',
        },
        {
          cityId: '220582',
          cityName: '集安市',
        },
      ],
    },
    {
      白山市: [
        {
          cityId: '220600',
          cityName: '白山市',
        },
        {
          cityId: '220601',
          cityName: '市辖区',
        },
        {
          cityId: '220602',
          cityName: '八道江区',
        },
        {
          cityId: '220605',
          cityName: '江源区',
        },
        {
          cityId: '220621',
          cityName: '抚松县',
        },
        {
          cityId: '220622',
          cityName: '靖宇县',
        },
        {
          cityId: '220623',
          cityName: '长白朝鲜族自治县',
        },
        {
          cityId: '220681',
          cityName: '临江市',
        },
      ],
    },
    {
      松原市: [
        {
          cityId: '220700',
          cityName: '松原市',
        },
        {
          cityId: '220701',
          cityName: '市辖区',
        },
        {
          cityId: '220702',
          cityName: '宁江区',
        },
        {
          cityId: '220721',
          cityName: '前郭尔罗斯蒙古族自治县',
        },
        {
          cityId: '220722',
          cityName: '长岭县',
        },
        {
          cityId: '220723',
          cityName: '乾安县',
        },
        {
          cityId: '220724',
          cityName: '扶余县',
        },
      ],
    },
    {
      白城市: [
        {
          cityId: '220800',
          cityName: '白城市',
        },
        {
          cityId: '220801',
          cityName: '市辖区',
        },
        {
          cityId: '220802',
          cityName: '洮北区',
        },
        {
          cityId: '220821',
          cityName: '镇赉县',
        },
        {
          cityId: '220822',
          cityName: '通榆县',
        },
        {
          cityId: '220881',
          cityName: '洮南市',
        },
        {
          cityId: '220882',
          cityName: '大安市',
        },
      ],
    },
    {
      延边朝鲜族自治州: [
        {
          cityId: '222400',
          cityName: '延边朝鲜族自治州',
        },
        {
          cityId: '222401',
          cityName: '延吉市',
        },
        {
          cityId: '222402',
          cityName: '图们市',
        },
        {
          cityId: '222403',
          cityName: '敦化市',
        },
        {
          cityId: '222404',
          cityName: '珲春市',
        },
        {
          cityId: '222405',
          cityName: '龙井市',
        },
        {
          cityId: '222406',
          cityName: '和龙市',
        },
        {
          cityId: '222424',
          cityName: '汪清县',
        },
        {
          cityId: '222426',
          cityName: '安图县',
        },
      ],
    },
  ],
  黑龙江省: [
    {
      cityId: '230000',
      cityName: '黑龙江省',
    },
    {
      哈尔滨市: [
        {
          cityId: '230100',
          cityName: '哈尔滨市',
        },
        {
          cityId: '230101',
          cityName: '市辖区',
        },
        {
          cityId: '230102',
          cityName: '道里区',
        },
        {
          cityId: '230103',
          cityName: '南岗区',
        },
        {
          cityId: '230104',
          cityName: '道外区',
        },
        {
          cityId: '230108',
          cityName: '平房区',
        },
        {
          cityId: '230109',
          cityName: '松北区',
        },
        {
          cityId: '230110',
          cityName: '香坊区',
        },
        {
          cityId: '230111',
          cityName: '呼兰区',
        },
        {
          cityId: '230112',
          cityName: '阿城区',
        },
        {
          cityId: '230123',
          cityName: '依兰县',
        },
        {
          cityId: '230124',
          cityName: '方正县',
        },
        {
          cityId: '230125',
          cityName: '宾　县',
        },
        {
          cityId: '230126',
          cityName: '巴彦县',
        },
        {
          cityId: '230127',
          cityName: '木兰县',
        },
        {
          cityId: '230128',
          cityName: '通河县',
        },
        {
          cityId: '230129',
          cityName: '延寿县',
        },
        {
          cityId: '230182',
          cityName: '双城市',
        },
        {
          cityId: '230183',
          cityName: '尚志市',
        },
        {
          cityId: '230184',
          cityName: '五常市',
        },
      ],
    },
    {
      齐齐哈尔市: [
        {
          cityId: '230200',
          cityName: '齐齐哈尔市',
        },
        {
          cityId: '230201',
          cityName: '市辖区',
        },
        {
          cityId: '230202',
          cityName: '龙沙区',
        },
        {
          cityId: '230203',
          cityName: '建华区',
        },
        {
          cityId: '230204',
          cityName: '铁锋区',
        },
        {
          cityId: '230205',
          cityName: '昂昂溪区',
        },
        {
          cityId: '230206',
          cityName: '富拉尔基区',
        },
        {
          cityId: '230207',
          cityName: '碾子山区',
        },
        {
          cityId: '230208',
          cityName: '梅里斯达斡尔族区',
        },
        {
          cityId: '230221',
          cityName: '龙江县',
        },
        {
          cityId: '230223',
          cityName: '依安县',
        },
        {
          cityId: '230224',
          cityName: '泰来县',
        },
        {
          cityId: '230225',
          cityName: '甘南县',
        },
        {
          cityId: '230227',
          cityName: '富裕县',
        },
        {
          cityId: '230229',
          cityName: '克山县',
        },
        {
          cityId: '230230',
          cityName: '克东县',
        },
        {
          cityId: '230231',
          cityName: '拜泉县',
        },
        {
          cityId: '230281',
          cityName: '讷河市',
        },
      ],
    },
    {
      鸡西市: [
        {
          cityId: '230300',
          cityName: '鸡西市',
        },
        {
          cityId: '230301',
          cityName: '市辖区',
        },
        {
          cityId: '230302',
          cityName: '鸡冠区',
        },
        {
          cityId: '230303',
          cityName: '恒山区',
        },
        {
          cityId: '230304',
          cityName: '滴道区',
        },
        {
          cityId: '230305',
          cityName: '梨树区',
        },
        {
          cityId: '230306',
          cityName: '城子河区',
        },
        {
          cityId: '230307',
          cityName: '麻山区',
        },
        {
          cityId: '230321',
          cityName: '鸡东县',
        },
        {
          cityId: '230381',
          cityName: '虎林市',
        },
        {
          cityId: '230382',
          cityName: '密山市',
        },
      ],
    },
    {
      鹤岗市: [
        {
          cityId: '230400',
          cityName: '鹤岗市',
        },
        {
          cityId: '230401',
          cityName: '市辖区',
        },
        {
          cityId: '230402',
          cityName: '向阳区',
        },
        {
          cityId: '230403',
          cityName: '工农区',
        },
        {
          cityId: '230404',
          cityName: '南山区',
        },
        {
          cityId: '230405',
          cityName: '兴安区',
        },
        {
          cityId: '230406',
          cityName: '东山区',
        },
        {
          cityId: '230407',
          cityName: '兴山区',
        },
        {
          cityId: '230421',
          cityName: '萝北县',
        },
        {
          cityId: '230422',
          cityName: '绥滨县',
        },
      ],
    },
    {
      双鸭山市: [
        {
          cityId: '230500',
          cityName: '双鸭山市',
        },
        {
          cityId: '230501',
          cityName: '市辖区',
        },
        {
          cityId: '230502',
          cityName: '尖山区',
        },
        {
          cityId: '230503',
          cityName: '岭东区',
        },
        {
          cityId: '230505',
          cityName: '四方台区',
        },
        {
          cityId: '230506',
          cityName: '宝山区',
        },
        {
          cityId: '230521',
          cityName: '集贤县',
        },
        {
          cityId: '230522',
          cityName: '友谊县',
        },
        {
          cityId: '230523',
          cityName: '宝清县',
        },
        {
          cityId: '230524',
          cityName: '饶河县',
        },
      ],
    },
    {
      大庆市: [
        {
          cityId: '230600',
          cityName: '大庆市',
        },
        {
          cityId: '230601',
          cityName: '市辖区',
        },
        {
          cityId: '230602',
          cityName: '萨尔图区',
        },
        {
          cityId: '230603',
          cityName: '龙凤区',
        },
        {
          cityId: '230604',
          cityName: '让胡路区',
        },
        {
          cityId: '230605',
          cityName: '红岗区',
        },
        {
          cityId: '230606',
          cityName: '大同区',
        },
        {
          cityId: '230621',
          cityName: '肇州县',
        },
        {
          cityId: '230622',
          cityName: '肇源县',
        },
        {
          cityId: '230623',
          cityName: '林甸县',
        },
        {
          cityId: '230624',
          cityName: '杜尔伯特蒙古族自治县',
        },
      ],
    },
    {
      伊春市: [
        {
          cityId: '230700',
          cityName: '伊春市',
        },
        {
          cityId: '230701',
          cityName: '市辖区',
        },
        {
          cityId: '230702',
          cityName: '伊春区',
        },
        {
          cityId: '230703',
          cityName: '南岔区',
        },
        {
          cityId: '230704',
          cityName: '友好区',
        },
        {
          cityId: '230705',
          cityName: '西林区',
        },
        {
          cityId: '230706',
          cityName: '翠峦区',
        },
        {
          cityId: '230707',
          cityName: '新青区',
        },
        {
          cityId: '230708',
          cityName: '美溪区',
        },
        {
          cityId: '230709',
          cityName: '金山屯区',
        },
        {
          cityId: '230710',
          cityName: '五营区',
        },
        {
          cityId: '230711',
          cityName: '乌马河区',
        },
        {
          cityId: '230712',
          cityName: '汤旺河区',
        },
        {
          cityId: '230713',
          cityName: '带岭区',
        },
        {
          cityId: '230714',
          cityName: '乌伊岭区',
        },
        {
          cityId: '230715',
          cityName: '红星区',
        },
        {
          cityId: '230716',
          cityName: '上甘岭区',
        },
        {
          cityId: '230722',
          cityName: '嘉荫县',
        },
        {
          cityId: '230781',
          cityName: '铁力市',
        },
      ],
    },
    {
      佳木斯市: [
        {
          cityId: '230800',
          cityName: '佳木斯市',
        },
        {
          cityId: '230801',
          cityName: '市辖区',
        },
        {
          cityId: '230803',
          cityName: '向阳区',
        },
        {
          cityId: '230804',
          cityName: '前进区',
        },
        {
          cityId: '230805',
          cityName: '东风区',
        },
        {
          cityId: '230811',
          cityName: '郊　区',
        },
        {
          cityId: '230822',
          cityName: '桦南县',
        },
        {
          cityId: '230826',
          cityName: '桦川县',
        },
        {
          cityId: '230828',
          cityName: '汤原县',
        },
        {
          cityId: '230833',
          cityName: '抚远县',
        },
        {
          cityId: '230881',
          cityName: '同江市',
        },
        {
          cityId: '230882',
          cityName: '富锦市',
        },
      ],
    },
    {
      七台河市: [
        {
          cityId: '230900',
          cityName: '七台河市',
        },
        {
          cityId: '230901',
          cityName: '市辖区',
        },
        {
          cityId: '230902',
          cityName: '新兴区',
        },
        {
          cityId: '230903',
          cityName: '桃山区',
        },
        {
          cityId: '230904',
          cityName: '茄子河区',
        },
        {
          cityId: '230921',
          cityName: '勃利县',
        },
      ],
    },
    {
      牡丹江市: [
        {
          cityId: '231000',
          cityName: '牡丹江市',
        },
        {
          cityId: '231001',
          cityName: '市辖区',
        },
        {
          cityId: '231002',
          cityName: '东安区',
        },
        {
          cityId: '231003',
          cityName: '阳明区',
        },
        {
          cityId: '231004',
          cityName: '爱民区',
        },
        {
          cityId: '231005',
          cityName: '西安区',
        },
        {
          cityId: '231024',
          cityName: '东宁县',
        },
        {
          cityId: '231025',
          cityName: '林口县',
        },
        {
          cityId: '231081',
          cityName: '绥芬河市',
        },
        {
          cityId: '231083',
          cityName: '海林市',
        },
        {
          cityId: '231084',
          cityName: '宁安市',
        },
        {
          cityId: '231085',
          cityName: '穆棱市',
        },
      ],
    },
    {
      黑河市: [
        {
          cityId: '231100',
          cityName: '黑河市',
        },
        {
          cityId: '231101',
          cityName: '市辖区',
        },
        {
          cityId: '231102',
          cityName: '爱辉区',
        },
        {
          cityId: '231121',
          cityName: '嫩江县',
        },
        {
          cityId: '231123',
          cityName: '逊克县',
        },
        {
          cityId: '231124',
          cityName: '孙吴县',
        },
        {
          cityId: '231181',
          cityName: '北安市',
        },
        {
          cityId: '231182',
          cityName: '五大连池市',
        },
      ],
    },
    {
      绥化市: [
        {
          cityId: '231200',
          cityName: '绥化市',
        },
        {
          cityId: '231201',
          cityName: '市辖区',
        },
        {
          cityId: '231202',
          cityName: '北林区',
        },
        {
          cityId: '231221',
          cityName: '望奎县',
        },
        {
          cityId: '231222',
          cityName: '兰西县',
        },
        {
          cityId: '231223',
          cityName: '青冈县',
        },
        {
          cityId: '231224',
          cityName: '庆安县',
        },
        {
          cityId: '231225',
          cityName: '明水县',
        },
        {
          cityId: '231226',
          cityName: '绥棱县',
        },
        {
          cityId: '231281',
          cityName: '安达市',
        },
        {
          cityId: '231282',
          cityName: '肇东市',
        },
        {
          cityId: '231283',
          cityName: '海伦市',
        },
      ],
    },
    {
      大兴安岭地区: [
        {
          cityId: '232700',
          cityName: '大兴安岭地区',
        },
        {
          cityId: '232721',
          cityName: '呼玛县',
        },
        {
          cityId: '232722',
          cityName: '塔河县',
        },
        {
          cityId: '232723',
          cityName: '漠河县',
        },
      ],
    },
  ],
  上海市: [
    {
      cityId: '310000',
      cityName: '上海市',
    },
    {
      市辖区: [
        {
          cityId: '310100',
          cityName: '市辖区',
        },
        {
          cityId: '310101',
          cityName: '黄浦区',
        },
        {
          cityId: '310103',
          cityName: '卢湾区',
        },
        {
          cityId: '310104',
          cityName: '徐汇区',
        },
        {
          cityId: '310105',
          cityName: '长宁区',
        },
        {
          cityId: '310106',
          cityName: '静安区',
        },
        {
          cityId: '310107',
          cityName: '普陀区',
        },
        {
          cityId: '310108',
          cityName: '闸北区',
        },
        {
          cityId: '310109',
          cityName: '虹口区',
        },
        {
          cityId: '310110',
          cityName: '杨浦区',
        },
        {
          cityId: '310112',
          cityName: '闵行区',
        },
        {
          cityId: '310113',
          cityName: '宝山区',
        },
        {
          cityId: '310114',
          cityName: '嘉定区',
        },
        {
          cityId: '310115',
          cityName: '浦东新区',
        },
        {
          cityId: '310116',
          cityName: '金山区',
        },
        {
          cityId: '310117',
          cityName: '松江区',
        },
        {
          cityId: '310118',
          cityName: '青浦区',
        },
        {
          cityId: '310120',
          cityName: '奉贤区',
        },
      ],
    },
    {
      县: [
        {
          cityId: '310200',
          cityName: '县',
        },
        {
          cityId: '310230',
          cityName: '崇明县',
        },
      ],
    },
  ],
  江苏省: [
    {
      cityId: '320000',
      cityName: '江苏省',
    },
    {
      南京市: [
        {
          cityId: '320100',
          cityName: '南京市',
        },
        {
          cityId: '320101',
          cityName: '市辖区',
        },
        {
          cityId: '320102',
          cityName: '玄武区',
        },
        {
          cityId: '320103',
          cityName: '白下区',
        },
        {
          cityId: '320104',
          cityName: '秦淮区',
        },
        {
          cityId: '320105',
          cityName: '建邺区',
        },
        {
          cityId: '320106',
          cityName: '鼓楼区',
        },
        {
          cityId: '320107',
          cityName: '下关区',
        },
        {
          cityId: '320111',
          cityName: '浦口区',
        },
        {
          cityId: '320113',
          cityName: '栖霞区',
        },
        {
          cityId: '320114',
          cityName: '雨花台区',
        },
        {
          cityId: '320115',
          cityName: '江宁区',
        },
        {
          cityId: '320116',
          cityName: '六合区',
        },
        {
          cityId: '320124',
          cityName: '溧水县',
        },
        {
          cityId: '320125',
          cityName: '高淳县',
        },
      ],
    },
    {
      无锡市: [
        {
          cityId: '320200',
          cityName: '无锡市',
        },
        {
          cityId: '320201',
          cityName: '市辖区',
        },
        {
          cityId: '320202',
          cityName: '崇安区',
        },
        {
          cityId: '320203',
          cityName: '南长区',
        },
        {
          cityId: '320204',
          cityName: '北塘区',
        },
        {
          cityId: '320205',
          cityName: '锡山区',
        },
        {
          cityId: '320206',
          cityName: '惠山区',
        },
        {
          cityId: '320211',
          cityName: '滨湖区',
        },
        {
          cityId: '320281',
          cityName: '江阴市',
        },
        {
          cityId: '320282',
          cityName: '宜兴市',
        },
      ],
    },
    {
      徐州市: [
        {
          cityId: '320300',
          cityName: '徐州市',
        },
        {
          cityId: '320301',
          cityName: '市辖区',
        },
        {
          cityId: '320302',
          cityName: '鼓楼区',
        },
        {
          cityId: '320303',
          cityName: '云龙区',
        },
        {
          cityId: '320304',
          cityName: '九里区',
        },
        {
          cityId: '320305',
          cityName: '贾汪区',
        },
        {
          cityId: '320311',
          cityName: '泉山区',
        },
        {
          cityId: '320321',
          cityName: '丰　县',
        },
        {
          cityId: '320322',
          cityName: '沛　县',
        },
        {
          cityId: '320323',
          cityName: '铜山县',
        },
        {
          cityId: '320324',
          cityName: '睢宁县',
        },
        {
          cityId: '320381',
          cityName: '新沂市',
        },
        {
          cityId: '320382',
          cityName: '邳州市',
        },
      ],
    },
    {
      常州市: [
        {
          cityId: '320400',
          cityName: '常州市',
        },
        {
          cityId: '320401',
          cityName: '市辖区',
        },
        {
          cityId: '320402',
          cityName: '天宁区',
        },
        {
          cityId: '320404',
          cityName: '钟楼区',
        },
        {
          cityId: '320405',
          cityName: '戚墅堰区',
        },
        {
          cityId: '320411',
          cityName: '新北区',
        },
        {
          cityId: '320412',
          cityName: '武进区',
        },
        {
          cityId: '320481',
          cityName: '溧阳市',
        },
        {
          cityId: '320482',
          cityName: '金坛市',
        },
      ],
    },
    {
      苏州市: [
        {
          cityId: '320500',
          cityName: '苏州市',
        },
        {
          cityId: '320501',
          cityName: '市辖区',
        },
        {
          cityId: '320502',
          cityName: '沧浪区',
        },
        {
          cityId: '320503',
          cityName: '平江区',
        },
        {
          cityId: '320504',
          cityName: '金阊区',
        },
        {
          cityId: '320505',
          cityName: '虎丘区',
        },
        {
          cityId: '320506',
          cityName: '吴中区',
        },
        {
          cityId: '320507',
          cityName: '相城区',
        },
        {
          cityId: '320581',
          cityName: '常熟市',
        },
        {
          cityId: '320582',
          cityName: '张家港市',
        },
        {
          cityId: '320583',
          cityName: '昆山市',
        },
        {
          cityId: '320584',
          cityName: '吴江市',
        },
        {
          cityId: '320585',
          cityName: '太仓市',
        },
      ],
    },
    {
      南通市: [
        {
          cityId: '320600',
          cityName: '南通市',
        },
        {
          cityId: '320601',
          cityName: '市辖区',
        },
        {
          cityId: '320602',
          cityName: '崇川区',
        },
        {
          cityId: '320611',
          cityName: '港闸区',
        },
        {
          cityId: '320612',
          cityName: '通州区',
        },
        {
          cityId: '320621',
          cityName: '海安县',
        },
        {
          cityId: '320623',
          cityName: '如东县',
        },
        {
          cityId: '320681',
          cityName: '启东市',
        },
        {
          cityId: '320682',
          cityName: '如皋市',
        },
        {
          cityId: '320684',
          cityName: '海门市',
        },
      ],
    },
    {
      连云港市: [
        {
          cityId: '320700',
          cityName: '连云港市',
        },
        {
          cityId: '320701',
          cityName: '市辖区',
        },
        {
          cityId: '320703',
          cityName: '连云区',
        },
        {
          cityId: '320705',
          cityName: '新浦区',
        },
        {
          cityId: '320706',
          cityName: '海州区',
        },
        {
          cityId: '320721',
          cityName: '赣榆县',
        },
        {
          cityId: '320722',
          cityName: '东海县',
        },
        {
          cityId: '320723',
          cityName: '灌云县',
        },
        {
          cityId: '320724',
          cityName: '灌南县',
        },
      ],
    },
    {
      淮安市: [
        {
          cityId: '320800',
          cityName: '淮安市',
        },
        {
          cityId: '320801',
          cityName: '市辖区',
        },
        {
          cityId: '320802',
          cityName: '清河区',
        },
        {
          cityId: '320803',
          cityName: '楚州区',
        },
        {
          cityId: '320804',
          cityName: '淮阴区',
        },
        {
          cityId: '320811',
          cityName: '清浦区',
        },
        {
          cityId: '320826',
          cityName: '涟水县',
        },
        {
          cityId: '320829',
          cityName: '洪泽县',
        },
        {
          cityId: '320830',
          cityName: '盱眙县',
        },
        {
          cityId: '320831',
          cityName: '金湖县',
        },
      ],
    },
    {
      盐城市: [
        {
          cityId: '320900',
          cityName: '盐城市',
        },
        {
          cityId: '320901',
          cityName: '市辖区',
        },
        {
          cityId: '320902',
          cityName: '亭湖区',
        },
        {
          cityId: '320903',
          cityName: '盐都区',
        },
        {
          cityId: '320921',
          cityName: '响水县',
        },
        {
          cityId: '320922',
          cityName: '滨海县',
        },
        {
          cityId: '320923',
          cityName: '阜宁县',
        },
        {
          cityId: '320924',
          cityName: '射阳县',
        },
        {
          cityId: '320925',
          cityName: '建湖县',
        },
        {
          cityId: '320981',
          cityName: '东台市',
        },
        {
          cityId: '320982',
          cityName: '大丰市',
        },
      ],
    },
    {
      扬州市: [
        {
          cityId: '321000',
          cityName: '扬州市',
        },
        {
          cityId: '321001',
          cityName: '市辖区',
        },
        {
          cityId: '321002',
          cityName: '广陵区',
        },
        {
          cityId: '321003',
          cityName: '邗江区',
        },
        {
          cityId: '321011',
          cityName: '维扬区',
        },
        {
          cityId: '321023',
          cityName: '宝应县',
        },
        {
          cityId: '321081',
          cityName: '仪征市',
        },
        {
          cityId: '321084',
          cityName: '高邮市',
        },
        {
          cityId: '321088',
          cityName: '江都市',
        },
      ],
    },
    {
      镇江市: [
        {
          cityId: '321100',
          cityName: '镇江市',
        },
        {
          cityId: '321101',
          cityName: '市辖区',
        },
        {
          cityId: '321102',
          cityName: '京口区',
        },
        {
          cityId: '321111',
          cityName: '润州区',
        },
        {
          cityId: '321112',
          cityName: '丹徒区',
        },
        {
          cityId: '321181',
          cityName: '丹阳市',
        },
        {
          cityId: '321182',
          cityName: '扬中市',
        },
        {
          cityId: '321183',
          cityName: '句容市',
        },
      ],
    },
    {
      泰州市: [
        {
          cityId: '321200',
          cityName: '泰州市',
        },
        {
          cityId: '321201',
          cityName: '市辖区',
        },
        {
          cityId: '321202',
          cityName: '海陵区',
        },
        {
          cityId: '321203',
          cityName: '高港区',
        },
        {
          cityId: '321281',
          cityName: '兴化市',
        },
        {
          cityId: '321282',
          cityName: '靖江市',
        },
        {
          cityId: '321283',
          cityName: '泰兴市',
        },
        {
          cityId: '321284',
          cityName: '姜堰市',
        },
      ],
    },
    {
      宿迁市: [
        {
          cityId: '321300',
          cityName: '宿迁市',
        },
        {
          cityId: '321301',
          cityName: '市辖区',
        },
        {
          cityId: '321302',
          cityName: '宿城区',
        },
        {
          cityId: '321311',
          cityName: '宿豫区',
        },
        {
          cityId: '321322',
          cityName: '沭阳县',
        },
        {
          cityId: '321323',
          cityName: '泗阳县',
        },
        {
          cityId: '321324',
          cityName: '泗洪县',
        },
      ],
    },
  ],
  浙江省: [
    {
      cityId: '330000',
      cityName: '浙江省',
    },
    {
      杭州市: [
        {
          cityId: '330100',
          cityName: '杭州市',
        },
        {
          cityId: '330101',
          cityName: '市辖区',
        },
        {
          cityId: '330102',
          cityName: '上城区',
        },
        {
          cityId: '330103',
          cityName: '下城区',
        },
        {
          cityId: '330104',
          cityName: '江干区',
        },
        {
          cityId: '330105',
          cityName: '拱墅区',
        },
        {
          cityId: '330106',
          cityName: '西湖区',
        },
        {
          cityId: '330108',
          cityName: '滨江区',
        },
        {
          cityId: '330109',
          cityName: '萧山区',
        },
        {
          cityId: '330110',
          cityName: '余杭区',
        },
        {
          cityId: '330122',
          cityName: '桐庐县',
        },
        {
          cityId: '330127',
          cityName: '淳安县',
        },
        {
          cityId: '330182',
          cityName: '建德市',
        },
        {
          cityId: '330183',
          cityName: '富阳市',
        },
        {
          cityId: '330185',
          cityName: '临安市',
        },
      ],
    },
    {
      宁波市: [
        {
          cityId: '330200',
          cityName: '宁波市',
        },
        {
          cityId: '330201',
          cityName: '市辖区',
        },
        {
          cityId: '330203',
          cityName: '海曙区',
        },
        {
          cityId: '330204',
          cityName: '江东区',
        },
        {
          cityId: '330205',
          cityName: '江北区',
        },
        {
          cityId: '330206',
          cityName: '北仑区',
        },
        {
          cityId: '330211',
          cityName: '镇海区',
        },
        {
          cityId: '330212',
          cityName: '鄞州区',
        },
        {
          cityId: '330225',
          cityName: '象山县',
        },
        {
          cityId: '330226',
          cityName: '宁海县',
        },
        {
          cityId: '330281',
          cityName: '余姚市',
        },
        {
          cityId: '330282',
          cityName: '慈溪市',
        },
        {
          cityId: '330283',
          cityName: '奉化市',
        },
      ],
    },
    {
      温州市: [
        {
          cityId: '330300',
          cityName: '温州市',
        },
        {
          cityId: '330301',
          cityName: '市辖区',
        },
        {
          cityId: '330302',
          cityName: '鹿城区',
        },
        {
          cityId: '330303',
          cityName: '龙湾区',
        },
        {
          cityId: '330304',
          cityName: '瓯海区',
        },
        {
          cityId: '330322',
          cityName: '洞头县',
        },
        {
          cityId: '330324',
          cityName: '永嘉县',
        },
        {
          cityId: '330326',
          cityName: '平阳县',
        },
        {
          cityId: '330327',
          cityName: '苍南县',
        },
        {
          cityId: '330328',
          cityName: '文成县',
        },
        {
          cityId: '330329',
          cityName: '泰顺县',
        },
        {
          cityId: '330381',
          cityName: '瑞安市',
        },
        {
          cityId: '330382',
          cityName: '乐清市',
        },
      ],
    },
    {
      嘉兴市: [
        {
          cityId: '330400',
          cityName: '嘉兴市',
        },
        {
          cityId: '330401',
          cityName: '市辖区',
        },
        {
          cityId: '330402',
          cityName: '南湖区',
        },
        {
          cityId: '330411',
          cityName: '秀洲区',
        },
        {
          cityId: '330421',
          cityName: '嘉善县',
        },
        {
          cityId: '330424',
          cityName: '海盐县',
        },
        {
          cityId: '330481',
          cityName: '海宁市',
        },
        {
          cityId: '330482',
          cityName: '平湖市',
        },
        {
          cityId: '330483',
          cityName: '桐乡市',
        },
      ],
    },
    {
      湖州市: [
        {
          cityId: '330500',
          cityName: '湖州市',
        },
        {
          cityId: '330501',
          cityName: '市辖区',
        },
        {
          cityId: '330502',
          cityName: '吴兴区',
        },
        {
          cityId: '330503',
          cityName: '南浔区',
        },
        {
          cityId: '330521',
          cityName: '德清县',
        },
        {
          cityId: '330522',
          cityName: '长兴县',
        },
        {
          cityId: '330523',
          cityName: '安吉县',
        },
      ],
    },
    {
      绍兴市: [
        {
          cityId: '330600',
          cityName: '绍兴市',
        },
        {
          cityId: '330601',
          cityName: '市辖区',
        },
        {
          cityId: '330602',
          cityName: '越城区',
        },
        {
          cityId: '330621',
          cityName: '绍兴县',
        },
        {
          cityId: '330624',
          cityName: '新昌县',
        },
        {
          cityId: '330681',
          cityName: '诸暨市',
        },
        {
          cityId: '330682',
          cityName: '上虞市',
        },
        {
          cityId: '330683',
          cityName: '嵊州市',
        },
      ],
    },
    {
      金华市: [
        {
          cityId: '330700',
          cityName: '金华市',
        },
        {
          cityId: '330701',
          cityName: '市辖区',
        },
        {
          cityId: '330702',
          cityName: '婺城区',
        },
        {
          cityId: '330703',
          cityName: '金东区',
        },
        {
          cityId: '330723',
          cityName: '武义县',
        },
        {
          cityId: '330726',
          cityName: '浦江县',
        },
        {
          cityId: '330727',
          cityName: '磐安县',
        },
        {
          cityId: '330781',
          cityName: '兰溪市',
        },
        {
          cityId: '330782',
          cityName: '义乌市',
        },
        {
          cityId: '330783',
          cityName: '东阳市',
        },
        {
          cityId: '330784',
          cityName: '永康市',
        },
      ],
    },
    {
      衢州市: [
        {
          cityId: '330800',
          cityName: '衢州市',
        },
        {
          cityId: '330801',
          cityName: '市辖区',
        },
        {
          cityId: '330802',
          cityName: '柯城区',
        },
        {
          cityId: '330803',
          cityName: '衢江区',
        },
        {
          cityId: '330822',
          cityName: '常山县',
        },
        {
          cityId: '330824',
          cityName: '开化县',
        },
        {
          cityId: '330825',
          cityName: '龙游县',
        },
        {
          cityId: '330881',
          cityName: '江山市',
        },
      ],
    },
    {
      舟山市: [
        {
          cityId: '330900',
          cityName: '舟山市',
        },
        {
          cityId: '330901',
          cityName: '市辖区',
        },
        {
          cityId: '330902',
          cityName: '定海区',
        },
        {
          cityId: '330903',
          cityName: '普陀区',
        },
        {
          cityId: '330921',
          cityName: '岱山县',
        },
        {
          cityId: '330922',
          cityName: '嵊泗县',
        },
      ],
    },
    {
      台州市: [
        {
          cityId: '331000',
          cityName: '台州市',
        },
        {
          cityId: '331001',
          cityName: '市辖区',
        },
        {
          cityId: '331002',
          cityName: '椒江区',
        },
        {
          cityId: '331003',
          cityName: '黄岩区',
        },
        {
          cityId: '331004',
          cityName: '路桥区',
        },
        {
          cityId: '331021',
          cityName: '玉环县',
        },
        {
          cityId: '331022',
          cityName: '三门县',
        },
        {
          cityId: '331023',
          cityName: '天台县',
        },
        {
          cityId: '331024',
          cityName: '仙居县',
        },
        {
          cityId: '331081',
          cityName: '温岭市',
        },
        {
          cityId: '331082',
          cityName: '临海市',
        },
      ],
    },
    {
      丽水市: [
        {
          cityId: '331100',
          cityName: '丽水市',
        },
        {
          cityId: '331101',
          cityName: '市辖区',
        },
        {
          cityId: '331102',
          cityName: '莲都区',
        },
        {
          cityId: '331121',
          cityName: '青田县',
        },
        {
          cityId: '331122',
          cityName: '缙云县',
        },
        {
          cityId: '331123',
          cityName: '遂昌县',
        },
        {
          cityId: '331124',
          cityName: '松阳县',
        },
        {
          cityId: '331125',
          cityName: '云和县',
        },
        {
          cityId: '331126',
          cityName: '庆元县',
        },
        {
          cityId: '331127',
          cityName: '景宁畲族自治县',
        },
        {
          cityId: '331181',
          cityName: '龙泉市',
        },
      ],
    },
  ],
  安徽省: [
    {
      cityId: '340000',
      cityName: '安徽省',
    },
    {
      合肥市: [
        {
          cityId: '340100',
          cityName: '合肥市',
        },
        {
          cityId: '340101',
          cityName: '市辖区',
        },
        {
          cityId: '340102',
          cityName: '瑶海区',
        },
        {
          cityId: '340103',
          cityName: '庐阳区',
        },
        {
          cityId: '340104',
          cityName: '蜀山区',
        },
        {
          cityId: '340111',
          cityName: '包河区',
        },
        {
          cityId: '340121',
          cityName: '长丰县',
        },
        {
          cityId: '340122',
          cityName: '肥东县',
        },
        {
          cityId: '340123',
          cityName: '肥西县',
        },
      ],
    },
    {
      芜湖市: [
        {
          cityId: '340200',
          cityName: '芜湖市',
        },
        {
          cityId: '340201',
          cityName: '市辖区',
        },
        {
          cityId: '340202',
          cityName: '镜湖区',
        },
        {
          cityId: '340203',
          cityName: '弋江区',
        },
        {
          cityId: '340207',
          cityName: '鸠江区',
        },
        {
          cityId: '340208',
          cityName: '三山区',
        },
        {
          cityId: '340221',
          cityName: '芜湖县',
        },
        {
          cityId: '340222',
          cityName: '繁昌县',
        },
        {
          cityId: '340223',
          cityName: '南陵县',
        },
      ],
    },
    {
      蚌埠市: [
        {
          cityId: '340300',
          cityName: '蚌埠市',
        },
        {
          cityId: '340301',
          cityName: '市辖区',
        },
        {
          cityId: '340302',
          cityName: '龙子湖区',
        },
        {
          cityId: '340303',
          cityName: '蚌山区',
        },
        {
          cityId: '340304',
          cityName: '禹会区',
        },
        {
          cityId: '340311',
          cityName: '淮上区',
        },
        {
          cityId: '340321',
          cityName: '怀远县',
        },
        {
          cityId: '340322',
          cityName: '五河县',
        },
        {
          cityId: '340323',
          cityName: '固镇县',
        },
      ],
    },
    {
      淮南市: [
        {
          cityId: '340400',
          cityName: '淮南市',
        },
        {
          cityId: '340401',
          cityName: '市辖区',
        },
        {
          cityId: '340402',
          cityName: '大通区',
        },
        {
          cityId: '340403',
          cityName: '田家庵区',
        },
        {
          cityId: '340404',
          cityName: '谢家集区',
        },
        {
          cityId: '340405',
          cityName: '八公山区',
        },
        {
          cityId: '340406',
          cityName: '潘集区',
        },
        {
          cityId: '340421',
          cityName: '凤台县',
        },
      ],
    },
    {
      马鞍山市: [
        {
          cityId: '340500',
          cityName: '马鞍山市',
        },
        {
          cityId: '340501',
          cityName: '市辖区',
        },
        {
          cityId: '340502',
          cityName: '金家庄区',
        },
        {
          cityId: '340503',
          cityName: '花山区',
        },
        {
          cityId: '340504',
          cityName: '雨山区',
        },
        {
          cityId: '340521',
          cityName: '当涂县',
        },
      ],
    },
    {
      淮北市: [
        {
          cityId: '340600',
          cityName: '淮北市',
        },
        {
          cityId: '340601',
          cityName: '市辖区',
        },
        {
          cityId: '340602',
          cityName: '杜集区',
        },
        {
          cityId: '340603',
          cityName: '相山区',
        },
        {
          cityId: '340604',
          cityName: '烈山区',
        },
        {
          cityId: '340621',
          cityName: '濉溪县',
        },
      ],
    },
    {
      铜陵市: [
        {
          cityId: '340700',
          cityName: '铜陵市',
        },
        {
          cityId: '340701',
          cityName: '市辖区',
        },
        {
          cityId: '340702',
          cityName: '铜官山区',
        },
        {
          cityId: '340703',
          cityName: '狮子山区',
        },
        {
          cityId: '340711',
          cityName: '郊　区',
        },
        {
          cityId: '340721',
          cityName: '铜陵县',
        },
      ],
    },
    {
      安庆市: [
        {
          cityId: '340800',
          cityName: '安庆市',
        },
        {
          cityId: '340801',
          cityName: '市辖区',
        },
        {
          cityId: '340802',
          cityName: '迎江区',
        },
        {
          cityId: '340803',
          cityName: '大观区',
        },
        {
          cityId: '340811',
          cityName: '宜秀区',
        },
        {
          cityId: '340822',
          cityName: '怀宁县',
        },
        {
          cityId: '340823',
          cityName: '枞阳县',
        },
        {
          cityId: '340824',
          cityName: '潜山县',
        },
        {
          cityId: '340825',
          cityName: '太湖县',
        },
        {
          cityId: '340826',
          cityName: '宿松县',
        },
        {
          cityId: '340827',
          cityName: '望江县',
        },
        {
          cityId: '340828',
          cityName: '岳西县',
        },
        {
          cityId: '340881',
          cityName: '桐城市',
        },
      ],
    },
    {
      黄山市: [
        {
          cityId: '341000',
          cityName: '黄山市',
        },
        {
          cityId: '341001',
          cityName: '市辖区',
        },
        {
          cityId: '341002',
          cityName: '屯溪区',
        },
        {
          cityId: '341003',
          cityName: '黄山区',
        },
        {
          cityId: '341004',
          cityName: '徽州区',
        },
        {
          cityId: '341021',
          cityName: '歙　县',
        },
        {
          cityId: '341022',
          cityName: '休宁县',
        },
        {
          cityId: '341023',
          cityName: '黟　县',
        },
        {
          cityId: '341024',
          cityName: '祁门县',
        },
      ],
    },
    {
      滁州市: [
        {
          cityId: '341100',
          cityName: '滁州市',
        },
        {
          cityId: '341101',
          cityName: '市辖区',
        },
        {
          cityId: '341102',
          cityName: '琅琊区',
        },
        {
          cityId: '341103',
          cityName: '南谯区',
        },
        {
          cityId: '341122',
          cityName: '来安县',
        },
        {
          cityId: '341124',
          cityName: '全椒县',
        },
        {
          cityId: '341125',
          cityName: '定远县',
        },
        {
          cityId: '341126',
          cityName: '凤阳县',
        },
        {
          cityId: '341181',
          cityName: '天长市',
        },
        {
          cityId: '341182',
          cityName: '明光市',
        },
      ],
    },
    {
      阜阳市: [
        {
          cityId: '341200',
          cityName: '阜阳市',
        },
        {
          cityId: '341201',
          cityName: '市辖区',
        },
        {
          cityId: '341202',
          cityName: '颍州区',
        },
        {
          cityId: '341203',
          cityName: '颍东区',
        },
        {
          cityId: '341204',
          cityName: '颍泉区',
        },
        {
          cityId: '341221',
          cityName: '临泉县',
        },
        {
          cityId: '341222',
          cityName: '太和县',
        },
        {
          cityId: '341225',
          cityName: '阜南县',
        },
        {
          cityId: '341226',
          cityName: '颍上县',
        },
        {
          cityId: '341282',
          cityName: '界首市',
        },
      ],
    },
    {
      宿州市: [
        {
          cityId: '341300',
          cityName: '宿州市',
        },
        {
          cityId: '341301',
          cityName: '市辖区',
        },
        {
          cityId: '341302',
          cityName: '埇桥区',
        },
        {
          cityId: '341321',
          cityName: '砀山县',
        },
        {
          cityId: '341322',
          cityName: '萧　县',
        },
        {
          cityId: '341323',
          cityName: '灵璧县',
        },
        {
          cityId: '341324',
          cityName: '泗　县',
        },
      ],
    },
    {
      巢湖市: [
        {
          cityId: '341400',
          cityName: '巢湖市',
        },
        {
          cityId: '341401',
          cityName: '市辖区',
        },
        {
          cityId: '341402',
          cityName: '居巢区',
        },
        {
          cityId: '341421',
          cityName: '庐江县',
        },
        {
          cityId: '341422',
          cityName: '无为县',
        },
        {
          cityId: '341423',
          cityName: '含山县',
        },
        {
          cityId: '341424',
          cityName: '和　县',
        },
      ],
    },
    {
      六安市: [
        {
          cityId: '341500',
          cityName: '六安市',
        },
        {
          cityId: '341501',
          cityName: '市辖区',
        },
        {
          cityId: '341502',
          cityName: '金安区',
        },
        {
          cityId: '341503',
          cityName: '裕安区',
        },
        {
          cityId: '341521',
          cityName: '寿　县',
        },
        {
          cityId: '341522',
          cityName: '霍邱县',
        },
        {
          cityId: '341523',
          cityName: '舒城县',
        },
        {
          cityId: '341524',
          cityName: '金寨县',
        },
        {
          cityId: '341525',
          cityName: '霍山县',
        },
      ],
    },
    {
      亳州市: [
        {
          cityId: '341600',
          cityName: '亳州市',
        },
        {
          cityId: '341601',
          cityName: '市辖区',
        },
        {
          cityId: '341602',
          cityName: '谯城区',
        },
        {
          cityId: '341621',
          cityName: '涡阳县',
        },
        {
          cityId: '341622',
          cityName: '蒙城县',
        },
        {
          cityId: '341623',
          cityName: '利辛县',
        },
      ],
    },
    {
      池州市: [
        {
          cityId: '341700',
          cityName: '池州市',
        },
        {
          cityId: '341701',
          cityName: '市辖区',
        },
        {
          cityId: '341702',
          cityName: '贵池区',
        },
        {
          cityId: '341721',
          cityName: '东至县',
        },
        {
          cityId: '341722',
          cityName: '石台县',
        },
        {
          cityId: '341723',
          cityName: '青阳县',
        },
      ],
    },
    {
      宣城市: [
        {
          cityId: '341800',
          cityName: '宣城市',
        },
        {
          cityId: '341801',
          cityName: '市辖区',
        },
        {
          cityId: '341802',
          cityName: '宣州区',
        },
        {
          cityId: '341821',
          cityName: '郎溪县',
        },
        {
          cityId: '341822',
          cityName: '广德县',
        },
        {
          cityId: '341823',
          cityName: '泾　县',
        },
        {
          cityId: '341824',
          cityName: '绩溪县',
        },
        {
          cityId: '341825',
          cityName: '旌德县',
        },
        {
          cityId: '341881',
          cityName: '宁国市',
        },
      ],
    },
  ],
  福建省: [
    {
      cityId: '350000',
      cityName: '福建省',
    },
    {
      福州市: [
        {
          cityId: '350100',
          cityName: '福州市',
        },
        {
          cityId: '350101',
          cityName: '市辖区',
        },
        {
          cityId: '350102',
          cityName: '鼓楼区',
        },
        {
          cityId: '350103',
          cityName: '台江区',
        },
        {
          cityId: '350104',
          cityName: '仓山区',
        },
        {
          cityId: '350105',
          cityName: '马尾区',
        },
        {
          cityId: '350111',
          cityName: '晋安区',
        },
        {
          cityId: '350121',
          cityName: '闽侯县',
        },
        {
          cityId: '350122',
          cityName: '连江县',
        },
        {
          cityId: '350123',
          cityName: '罗源县',
        },
        {
          cityId: '350124',
          cityName: '闽清县',
        },
        {
          cityId: '350125',
          cityName: '永泰县',
        },
        {
          cityId: '350128',
          cityName: '平潭县',
        },
        {
          cityId: '350181',
          cityName: '福清市',
        },
        {
          cityId: '350182',
          cityName: '长乐市',
        },
      ],
    },
    {
      厦门市: [
        {
          cityId: '350200',
          cityName: '厦门市',
        },
        {
          cityId: '350201',
          cityName: '市辖区',
        },
        {
          cityId: '350203',
          cityName: '思明区',
        },
        {
          cityId: '350205',
          cityName: '海沧区',
        },
        {
          cityId: '350206',
          cityName: '湖里区',
        },
        {
          cityId: '350211',
          cityName: '集美区',
        },
        {
          cityId: '350212',
          cityName: '同安区',
        },
        {
          cityId: '350213',
          cityName: '翔安区',
        },
      ],
    },
    {
      莆田市: [
        {
          cityId: '350300',
          cityName: '莆田市',
        },
        {
          cityId: '350301',
          cityName: '市辖区',
        },
        {
          cityId: '350302',
          cityName: '城厢区',
        },
        {
          cityId: '350303',
          cityName: '涵江区',
        },
        {
          cityId: '350304',
          cityName: '荔城区',
        },
        {
          cityId: '350305',
          cityName: '秀屿区',
        },
        {
          cityId: '350322',
          cityName: '仙游县',
        },
      ],
    },
    {
      三明市: [
        {
          cityId: '350400',
          cityName: '三明市',
        },
        {
          cityId: '350401',
          cityName: '市辖区',
        },
        {
          cityId: '350402',
          cityName: '梅列区',
        },
        {
          cityId: '350403',
          cityName: '三元区',
        },
        {
          cityId: '350421',
          cityName: '明溪县',
        },
        {
          cityId: '350423',
          cityName: '清流县',
        },
        {
          cityId: '350424',
          cityName: '宁化县',
        },
        {
          cityId: '350425',
          cityName: '大田县',
        },
        {
          cityId: '350426',
          cityName: '尤溪县',
        },
        {
          cityId: '350427',
          cityName: '沙　县',
        },
        {
          cityId: '350428',
          cityName: '将乐县',
        },
        {
          cityId: '350429',
          cityName: '泰宁县',
        },
        {
          cityId: '350430',
          cityName: '建宁县',
        },
        {
          cityId: '350481',
          cityName: '永安市',
        },
      ],
    },
    {
      泉州市: [
        {
          cityId: '350500',
          cityName: '泉州市',
        },
        {
          cityId: '350501',
          cityName: '市辖区',
        },
        {
          cityId: '350502',
          cityName: '鲤城区',
        },
        {
          cityId: '350503',
          cityName: '丰泽区',
        },
        {
          cityId: '350504',
          cityName: '洛江区',
        },
        {
          cityId: '350505',
          cityName: '泉港区',
        },
        {
          cityId: '350521',
          cityName: '惠安县',
        },
        {
          cityId: '350524',
          cityName: '安溪县',
        },
        {
          cityId: '350525',
          cityName: '永春县',
        },
        {
          cityId: '350526',
          cityName: '德化县',
        },
        {
          cityId: '350527',
          cityName: '金门县',
        },
        {
          cityId: '350581',
          cityName: '石狮市',
        },
        {
          cityId: '350582',
          cityName: '晋江市',
        },
        {
          cityId: '350583',
          cityName: '南安市',
        },
      ],
    },
    {
      漳州市: [
        {
          cityId: '350600',
          cityName: '漳州市',
        },
        {
          cityId: '350601',
          cityName: '市辖区',
        },
        {
          cityId: '350602',
          cityName: '芗城区',
        },
        {
          cityId: '350603',
          cityName: '龙文区',
        },
        {
          cityId: '350622',
          cityName: '云霄县',
        },
        {
          cityId: '350623',
          cityName: '漳浦县',
        },
        {
          cityId: '350624',
          cityName: '诏安县',
        },
        {
          cityId: '350625',
          cityName: '长泰县',
        },
        {
          cityId: '350626',
          cityName: '东山县',
        },
        {
          cityId: '350627',
          cityName: '南靖县',
        },
        {
          cityId: '350628',
          cityName: '平和县',
        },
        {
          cityId: '350629',
          cityName: '华安县',
        },
        {
          cityId: '350681',
          cityName: '龙海市',
        },
      ],
    },
    {
      南平市: [
        {
          cityId: '350700',
          cityName: '南平市',
        },
        {
          cityId: '350701',
          cityName: '市辖区',
        },
        {
          cityId: '350702',
          cityName: '延平区',
        },
        {
          cityId: '350721',
          cityName: '顺昌县',
        },
        {
          cityId: '350722',
          cityName: '浦城县',
        },
        {
          cityId: '350723',
          cityName: '光泽县',
        },
        {
          cityId: '350724',
          cityName: '松溪县',
        },
        {
          cityId: '350725',
          cityName: '政和县',
        },
        {
          cityId: '350781',
          cityName: '邵武市',
        },
        {
          cityId: '350782',
          cityName: '武夷山市',
        },
        {
          cityId: '350783',
          cityName: '建瓯市',
        },
        {
          cityId: '350784',
          cityName: '建阳市',
        },
      ],
    },
    {
      龙岩市: [
        {
          cityId: '350800',
          cityName: '龙岩市',
        },
        {
          cityId: '350801',
          cityName: '市辖区',
        },
        {
          cityId: '350802',
          cityName: '新罗区',
        },
        {
          cityId: '350821',
          cityName: '长汀县',
        },
        {
          cityId: '350822',
          cityName: '永定县',
        },
        {
          cityId: '350823',
          cityName: '上杭县',
        },
        {
          cityId: '350824',
          cityName: '武平县',
        },
        {
          cityId: '350825',
          cityName: '连城县',
        },
        {
          cityId: '350881',
          cityName: '漳平市',
        },
      ],
    },
    {
      宁德市: [
        {
          cityId: '350900',
          cityName: '宁德市',
        },
        {
          cityId: '350901',
          cityName: '市辖区',
        },
        {
          cityId: '350902',
          cityName: '蕉城区',
        },
        {
          cityId: '350921',
          cityName: '霞浦县',
        },
        {
          cityId: '350922',
          cityName: '古田县',
        },
        {
          cityId: '350923',
          cityName: '屏南县',
        },
        {
          cityId: '350924',
          cityName: '寿宁县',
        },
        {
          cityId: '350925',
          cityName: '周宁县',
        },
        {
          cityId: '350926',
          cityName: '柘荣县',
        },
        {
          cityId: '350981',
          cityName: '福安市',
        },
        {
          cityId: '350982',
          cityName: '福鼎市',
        },
      ],
    },
  ],
  江西省: [
    {
      cityId: '360000',
      cityName: '江西省',
    },
    {
      南昌市: [
        {
          cityId: '360100',
          cityName: '南昌市',
        },
        {
          cityId: '360101',
          cityName: '市辖区',
        },
        {
          cityId: '360102',
          cityName: '东湖区',
        },
        {
          cityId: '360103',
          cityName: '西湖区',
        },
        {
          cityId: '360104',
          cityName: '青云谱区',
        },
        {
          cityId: '360105',
          cityName: '湾里区',
        },
        {
          cityId: '360111',
          cityName: '青山湖区',
        },
        {
          cityId: '360121',
          cityName: '南昌县',
        },
        {
          cityId: '360122',
          cityName: '新建县',
        },
        {
          cityId: '360123',
          cityName: '安义县',
        },
        {
          cityId: '360124',
          cityName: '进贤县',
        },
      ],
    },
    {
      景德镇市: [
        {
          cityId: '360200',
          cityName: '景德镇市',
        },
        {
          cityId: '360201',
          cityName: '市辖区',
        },
        {
          cityId: '360202',
          cityName: '昌江区',
        },
        {
          cityId: '360203',
          cityName: '珠山区',
        },
        {
          cityId: '360222',
          cityName: '浮梁县',
        },
        {
          cityId: '360281',
          cityName: '乐平市',
        },
      ],
    },
    {
      萍乡市: [
        {
          cityId: '360300',
          cityName: '萍乡市',
        },
        {
          cityId: '360301',
          cityName: '市辖区',
        },
        {
          cityId: '360302',
          cityName: '安源区',
        },
        {
          cityId: '360313',
          cityName: '湘东区',
        },
        {
          cityId: '360321',
          cityName: '莲花县',
        },
        {
          cityId: '360322',
          cityName: '上栗县',
        },
        {
          cityId: '360323',
          cityName: '芦溪县',
        },
      ],
    },
    {
      九江市: [
        {
          cityId: '360400',
          cityName: '九江市',
        },
        {
          cityId: '360401',
          cityName: '市辖区',
        },
        {
          cityId: '360402',
          cityName: '庐山区',
        },
        {
          cityId: '360403',
          cityName: '浔阳区',
        },
        {
          cityId: '360421',
          cityName: '九江县',
        },
        {
          cityId: '360423',
          cityName: '武宁县',
        },
        {
          cityId: '360424',
          cityName: '修水县',
        },
        {
          cityId: '360425',
          cityName: '永修县',
        },
        {
          cityId: '360426',
          cityName: '德安县',
        },
        {
          cityId: '360427',
          cityName: '星子县',
        },
        {
          cityId: '360428',
          cityName: '都昌县',
        },
        {
          cityId: '360429',
          cityName: '湖口县',
        },
        {
          cityId: '360430',
          cityName: '彭泽县',
        },
        {
          cityId: '360481',
          cityName: '瑞昌市',
        },
      ],
    },
    {
      新余市: [
        {
          cityId: '360500',
          cityName: '新余市',
        },
        {
          cityId: '360501',
          cityName: '市辖区',
        },
        {
          cityId: '360502',
          cityName: '渝水区',
        },
        {
          cityId: '360521',
          cityName: '分宜县',
        },
      ],
    },
    {
      鹰潭市: [
        {
          cityId: '360600',
          cityName: '鹰潭市',
        },
        {
          cityId: '360601',
          cityName: '市辖区',
        },
        {
          cityId: '360602',
          cityName: '月湖区',
        },
        {
          cityId: '360622',
          cityName: '余江县',
        },
        {
          cityId: '360681',
          cityName: '贵溪市',
        },
      ],
    },
    {
      赣州市: [
        {
          cityId: '360700',
          cityName: '赣州市',
        },
        {
          cityId: '360701',
          cityName: '市辖区',
        },
        {
          cityId: '360702',
          cityName: '章贡区',
        },
        {
          cityId: '360721',
          cityName: '赣　县',
        },
        {
          cityId: '360722',
          cityName: '信丰县',
        },
        {
          cityId: '360723',
          cityName: '大余县',
        },
        {
          cityId: '360724',
          cityName: '上犹县',
        },
        {
          cityId: '360725',
          cityName: '崇义县',
        },
        {
          cityId: '360726',
          cityName: '安远县',
        },
        {
          cityId: '360727',
          cityName: '龙南县',
        },
        {
          cityId: '360728',
          cityName: '定南县',
        },
        {
          cityId: '360729',
          cityName: '全南县',
        },
        {
          cityId: '360730',
          cityName: '宁都县',
        },
        {
          cityId: '360731',
          cityName: '于都县',
        },
        {
          cityId: '360732',
          cityName: '兴国县',
        },
        {
          cityId: '360733',
          cityName: '会昌县',
        },
        {
          cityId: '360734',
          cityName: '寻乌县',
        },
        {
          cityId: '360735',
          cityName: '石城县',
        },
        {
          cityId: '360781',
          cityName: '瑞金市',
        },
        {
          cityId: '360782',
          cityName: '南康市',
        },
      ],
    },
    {
      吉安市: [
        {
          cityId: '360800',
          cityName: '吉安市',
        },
        {
          cityId: '360801',
          cityName: '市辖区',
        },
        {
          cityId: '360802',
          cityName: '吉州区',
        },
        {
          cityId: '360803',
          cityName: '青原区',
        },
        {
          cityId: '360821',
          cityName: '吉安县',
        },
        {
          cityId: '360822',
          cityName: '吉水县',
        },
        {
          cityId: '360823',
          cityName: '峡江县',
        },
        {
          cityId: '360824',
          cityName: '新干县',
        },
        {
          cityId: '360825',
          cityName: '永丰县',
        },
        {
          cityId: '360826',
          cityName: '泰和县',
        },
        {
          cityId: '360827',
          cityName: '遂川县',
        },
        {
          cityId: '360828',
          cityName: '万安县',
        },
        {
          cityId: '360829',
          cityName: '安福县',
        },
        {
          cityId: '360830',
          cityName: '永新县',
        },
        {
          cityId: '360881',
          cityName: '井冈山市',
        },
      ],
    },
    {
      宜春市: [
        {
          cityId: '360900',
          cityName: '宜春市',
        },
        {
          cityId: '360901',
          cityName: '市辖区',
        },
        {
          cityId: '360902',
          cityName: '袁州区',
        },
        {
          cityId: '360921',
          cityName: '奉新县',
        },
        {
          cityId: '360922',
          cityName: '万载县',
        },
        {
          cityId: '360923',
          cityName: '上高县',
        },
        {
          cityId: '360924',
          cityName: '宜丰县',
        },
        {
          cityId: '360925',
          cityName: '靖安县',
        },
        {
          cityId: '360926',
          cityName: '铜鼓县',
        },
        {
          cityId: '360981',
          cityName: '丰城市',
        },
        {
          cityId: '360982',
          cityName: '樟树市',
        },
        {
          cityId: '360983',
          cityName: '高安市',
        },
      ],
    },
    {
      抚州市: [
        {
          cityId: '361000',
          cityName: '抚州市',
        },
        {
          cityId: '361001',
          cityName: '市辖区',
        },
        {
          cityId: '361002',
          cityName: '临川区',
        },
        {
          cityId: '361021',
          cityName: '南城县',
        },
        {
          cityId: '361022',
          cityName: '黎川县',
        },
        {
          cityId: '361023',
          cityName: '南丰县',
        },
        {
          cityId: '361024',
          cityName: '崇仁县',
        },
        {
          cityId: '361025',
          cityName: '乐安县',
        },
        {
          cityId: '361026',
          cityName: '宜黄县',
        },
        {
          cityId: '361027',
          cityName: '金溪县',
        },
        {
          cityId: '361028',
          cityName: '资溪县',
        },
        {
          cityId: '361029',
          cityName: '东乡县',
        },
        {
          cityId: '361030',
          cityName: '广昌县',
        },
      ],
    },
    {
      上饶市: [
        {
          cityId: '361100',
          cityName: '上饶市',
        },
        {
          cityId: '361101',
          cityName: '市辖区',
        },
        {
          cityId: '361102',
          cityName: '信州区',
        },
        {
          cityId: '361121',
          cityName: '上饶县',
        },
        {
          cityId: '361122',
          cityName: '广丰县',
        },
        {
          cityId: '361123',
          cityName: '玉山县',
        },
        {
          cityId: '361124',
          cityName: '铅山县',
        },
        {
          cityId: '361125',
          cityName: '横峰县',
        },
        {
          cityId: '361126',
          cityName: '弋阳县',
        },
        {
          cityId: '361127',
          cityName: '余干县',
        },
        {
          cityId: '361128',
          cityName: '鄱阳县',
        },
        {
          cityId: '361129',
          cityName: '万年县',
        },
        {
          cityId: '361130',
          cityName: '婺源县',
        },
        {
          cityId: '361181',
          cityName: '德兴市',
        },
      ],
    },
  ],
  山东省: [
    {
      cityId: '370000',
      cityName: '山东省',
    },
    {
      济南市: [
        {
          cityId: '370100',
          cityName: '济南市',
        },
        {
          cityId: '370101',
          cityName: '市辖区',
        },
        {
          cityId: '370102',
          cityName: '历下区',
        },
        {
          cityId: '370103',
          cityName: '市中区',
        },
        {
          cityId: '370104',
          cityName: '槐荫区',
        },
        {
          cityId: '370105',
          cityName: '天桥区',
        },
        {
          cityId: '370112',
          cityName: '历城区',
        },
        {
          cityId: '370113',
          cityName: '长清区',
        },
        {
          cityId: '370124',
          cityName: '平阴县',
        },
        {
          cityId: '370125',
          cityName: '济阳县',
        },
        {
          cityId: '370126',
          cityName: '商河县',
        },
        {
          cityId: '370181',
          cityName: '章丘市',
        },
      ],
    },
    {
      青岛市: [
        {
          cityId: '370200',
          cityName: '青岛市',
        },
        {
          cityId: '370201',
          cityName: '市辖区',
        },
        {
          cityId: '370202',
          cityName: '市南区',
        },
        {
          cityId: '370203',
          cityName: '市北区',
        },
        {
          cityId: '370205',
          cityName: '四方区',
        },
        {
          cityId: '370211',
          cityName: '黄岛区',
        },
        {
          cityId: '370212',
          cityName: '崂山区',
        },
        {
          cityId: '370213',
          cityName: '李沧区',
        },
        {
          cityId: '370214',
          cityName: '城阳区',
        },
        {
          cityId: '370281',
          cityName: '胶州市',
        },
        {
          cityId: '370282',
          cityName: '即墨市',
        },
        {
          cityId: '370283',
          cityName: '平度市',
        },
        {
          cityId: '370284',
          cityName: '胶南市',
        },
        {
          cityId: '370285',
          cityName: '莱西市',
        },
      ],
    },
    {
      淄博市: [
        {
          cityId: '370300',
          cityName: '淄博市',
        },
        {
          cityId: '370301',
          cityName: '市辖区',
        },
        {
          cityId: '370302',
          cityName: '淄川区',
        },
        {
          cityId: '370303',
          cityName: '张店区',
        },
        {
          cityId: '370304',
          cityName: '博山区',
        },
        {
          cityId: '370305',
          cityName: '临淄区',
        },
        {
          cityId: '370306',
          cityName: '周村区',
        },
        {
          cityId: '370321',
          cityName: '桓台县',
        },
        {
          cityId: '370322',
          cityName: '高青县',
        },
        {
          cityId: '370323',
          cityName: '沂源县',
        },
      ],
    },
    {
      枣庄市: [
        {
          cityId: '370400',
          cityName: '枣庄市',
        },
        {
          cityId: '370401',
          cityName: '市辖区',
        },
        {
          cityId: '370402',
          cityName: '市中区',
        },
        {
          cityId: '370403',
          cityName: '薛城区',
        },
        {
          cityId: '370404',
          cityName: '峄城区',
        },
        {
          cityId: '370405',
          cityName: '台儿庄区',
        },
        {
          cityId: '370406',
          cityName: '山亭区',
        },
        {
          cityId: '370481',
          cityName: '滕州市',
        },
      ],
    },
    {
      东营市: [
        {
          cityId: '370500',
          cityName: '东营市',
        },
        {
          cityId: '370501',
          cityName: '市辖区',
        },
        {
          cityId: '370502',
          cityName: '东营区',
        },
        {
          cityId: '370503',
          cityName: '河口区',
        },
        {
          cityId: '370521',
          cityName: '垦利县',
        },
        {
          cityId: '370522',
          cityName: '利津县',
        },
        {
          cityId: '370523',
          cityName: '广饶县',
        },
      ],
    },
    {
      烟台市: [
        {
          cityId: '370600',
          cityName: '烟台市',
        },
        {
          cityId: '370601',
          cityName: '市辖区',
        },
        {
          cityId: '370602',
          cityName: '芝罘区',
        },
        {
          cityId: '370611',
          cityName: '福山区',
        },
        {
          cityId: '370612',
          cityName: '牟平区',
        },
        {
          cityId: '370613',
          cityName: '莱山区',
        },
        {
          cityId: '370634',
          cityName: '长岛县',
        },
        {
          cityId: '370681',
          cityName: '龙口市',
        },
        {
          cityId: '370682',
          cityName: '莱阳市',
        },
        {
          cityId: '370683',
          cityName: '莱州市',
        },
        {
          cityId: '370684',
          cityName: '蓬莱市',
        },
        {
          cityId: '370685',
          cityName: '招远市',
        },
        {
          cityId: '370686',
          cityName: '栖霞市',
        },
        {
          cityId: '370687',
          cityName: '海阳市',
        },
      ],
    },
    {
      潍坊市: [
        {
          cityId: '370700',
          cityName: '潍坊市',
        },
        {
          cityId: '370701',
          cityName: '市辖区',
        },
        {
          cityId: '370702',
          cityName: '潍城区',
        },
        {
          cityId: '370703',
          cityName: '寒亭区',
        },
        {
          cityId: '370704',
          cityName: '坊子区',
        },
        {
          cityId: '370705',
          cityName: '奎文区',
        },
        {
          cityId: '370724',
          cityName: '临朐县',
        },
        {
          cityId: '370725',
          cityName: '昌乐县',
        },
        {
          cityId: '370781',
          cityName: '青州市',
        },
        {
          cityId: '370782',
          cityName: '诸城市',
        },
        {
          cityId: '370783',
          cityName: '寿光市',
        },
        {
          cityId: '370784',
          cityName: '安丘市',
        },
        {
          cityId: '370785',
          cityName: '高密市',
        },
        {
          cityId: '370786',
          cityName: '昌邑市',
        },
      ],
    },
    {
      济宁市: [
        {
          cityId: '370800',
          cityName: '济宁市',
        },
        {
          cityId: '370801',
          cityName: '市辖区',
        },
        {
          cityId: '370802',
          cityName: '市中区',
        },
        {
          cityId: '370811',
          cityName: '任城区',
        },
        {
          cityId: '370826',
          cityName: '微山县',
        },
        {
          cityId: '370827',
          cityName: '鱼台县',
        },
        {
          cityId: '370828',
          cityName: '金乡县',
        },
        {
          cityId: '370829',
          cityName: '嘉祥县',
        },
        {
          cityId: '370830',
          cityName: '汶上县',
        },
        {
          cityId: '370831',
          cityName: '泗水县',
        },
        {
          cityId: '370832',
          cityName: '梁山县',
        },
        {
          cityId: '370881',
          cityName: '曲阜市',
        },
        {
          cityId: '370882',
          cityName: '兖州市',
        },
        {
          cityId: '370883',
          cityName: '邹城市',
        },
      ],
    },
    {
      泰安市: [
        {
          cityId: '370900',
          cityName: '泰安市',
        },
        {
          cityId: '370901',
          cityName: '市辖区',
        },
        {
          cityId: '370902',
          cityName: '泰山区',
        },
        {
          cityId: '370911',
          cityName: '岱岳区',
        },
        {
          cityId: '370921',
          cityName: '宁阳县',
        },
        {
          cityId: '370923',
          cityName: '东平县',
        },
        {
          cityId: '370982',
          cityName: '新泰市',
        },
        {
          cityId: '370983',
          cityName: '肥城市',
        },
      ],
    },
    {
      威海市: [
        {
          cityId: '371000',
          cityName: '威海市',
        },
        {
          cityId: '371001',
          cityName: '市辖区',
        },
        {
          cityId: '371002',
          cityName: '环翠区',
        },
        {
          cityId: '371081',
          cityName: '文登市',
        },
        {
          cityId: '371082',
          cityName: '荣成市',
        },
        {
          cityId: '371083',
          cityName: '乳山市',
        },
      ],
    },
    {
      日照市: [
        {
          cityId: '371100',
          cityName: '日照市',
        },
        {
          cityId: '371101',
          cityName: '市辖区',
        },
        {
          cityId: '371102',
          cityName: '东港区',
        },
        {
          cityId: '371103',
          cityName: '岚山区',
        },
        {
          cityId: '371121',
          cityName: '五莲县',
        },
        {
          cityId: '371122',
          cityName: '莒　县',
        },
      ],
    },
    {
      莱芜市: [
        {
          cityId: '371200',
          cityName: '莱芜市',
        },
        {
          cityId: '371201',
          cityName: '市辖区',
        },
        {
          cityId: '371202',
          cityName: '莱城区',
        },
        {
          cityId: '371203',
          cityName: '钢城区',
        },
      ],
    },
    {
      临沂市: [
        {
          cityId: '371300',
          cityName: '临沂市',
        },
        {
          cityId: '371301',
          cityName: '市辖区',
        },
        {
          cityId: '371302',
          cityName: '兰山区',
        },
        {
          cityId: '371311',
          cityName: '罗庄区',
        },
        {
          cityId: '371312',
          cityName: '河东区',
        },
        {
          cityId: '371321',
          cityName: '沂南县',
        },
        {
          cityId: '371322',
          cityName: '郯城县',
        },
        {
          cityId: '371323',
          cityName: '沂水县',
        },
        {
          cityId: '371324',
          cityName: '苍山县',
        },
        {
          cityId: '371325',
          cityName: '费　县',
        },
        {
          cityId: '371326',
          cityName: '平邑县',
        },
        {
          cityId: '371327',
          cityName: '莒南县',
        },
        {
          cityId: '371328',
          cityName: '蒙阴县',
        },
        {
          cityId: '371329',
          cityName: '临沭县',
        },
      ],
    },
    {
      德州市: [
        {
          cityId: '371400',
          cityName: '德州市',
        },
        {
          cityId: '371401',
          cityName: '市辖区',
        },
        {
          cityId: '371402',
          cityName: '德城区',
        },
        {
          cityId: '371421',
          cityName: '陵　县',
        },
        {
          cityId: '371422',
          cityName: '宁津县',
        },
        {
          cityId: '371423',
          cityName: '庆云县',
        },
        {
          cityId: '371424',
          cityName: '临邑县',
        },
        {
          cityId: '371425',
          cityName: '齐河县',
        },
        {
          cityId: '371426',
          cityName: '平原县',
        },
        {
          cityId: '371427',
          cityName: '夏津县',
        },
        {
          cityId: '371428',
          cityName: '武城县',
        },
        {
          cityId: '371481',
          cityName: '乐陵市',
        },
        {
          cityId: '371482',
          cityName: '禹城市',
        },
      ],
    },
    {
      聊城市: [
        {
          cityId: '371500',
          cityName: '聊城市',
        },
        {
          cityId: '371501',
          cityName: '市辖区',
        },
        {
          cityId: '371502',
          cityName: '东昌府区',
        },
        {
          cityId: '371521',
          cityName: '阳谷县',
        },
        {
          cityId: '371522',
          cityName: '莘　县',
        },
        {
          cityId: '371523',
          cityName: '茌平县',
        },
        {
          cityId: '371524',
          cityName: '东阿县',
        },
        {
          cityId: '371525',
          cityName: '冠　县',
        },
        {
          cityId: '371526',
          cityName: '高唐县',
        },
        {
          cityId: '371581',
          cityName: '临清市',
        },
      ],
    },
    {
      滨州市: [
        {
          cityId: '371600',
          cityName: '滨州市',
        },
        {
          cityId: '371601',
          cityName: '市辖区',
        },
        {
          cityId: '371602',
          cityName: '滨城区',
        },
        {
          cityId: '371621',
          cityName: '惠民县',
        },
        {
          cityId: '371622',
          cityName: '阳信县',
        },
        {
          cityId: '371623',
          cityName: '无棣县',
        },
        {
          cityId: '371624',
          cityName: '沾化县',
        },
        {
          cityId: '371625',
          cityName: '博兴县',
        },
        {
          cityId: '371626',
          cityName: '邹平县',
        },
      ],
    },
    {
      菏泽市: [
        {
          cityId: '371700',
          cityName: '菏泽市',
        },
        {
          cityId: '371701',
          cityName: '市辖区',
        },
        {
          cityId: '371702',
          cityName: '牡丹区',
        },
        {
          cityId: '371721',
          cityName: '曹　县',
        },
        {
          cityId: '371722',
          cityName: '单　县',
        },
        {
          cityId: '371723',
          cityName: '成武县',
        },
        {
          cityId: '371724',
          cityName: '巨野县',
        },
        {
          cityId: '371725',
          cityName: '郓城县',
        },
        {
          cityId: '371726',
          cityName: '鄄城县',
        },
        {
          cityId: '371727',
          cityName: '定陶县',
        },
        {
          cityId: '371728',
          cityName: '东明县',
        },
      ],
    },
  ],
  河南省: [
    {
      cityId: '410000',
      cityName: '河南省',
    },
    {
      郑州市: [
        {
          cityId: '410100',
          cityName: '郑州市',
        },
        {
          cityId: '410101',
          cityName: '市辖区',
        },
        {
          cityId: '410102',
          cityName: '中原区',
        },
        {
          cityId: '410103',
          cityName: '二七区',
        },
        {
          cityId: '410104',
          cityName: '管城回族区',
        },
        {
          cityId: '410105',
          cityName: '金水区',
        },
        {
          cityId: '410106',
          cityName: '上街区',
        },
        {
          cityId: '410108',
          cityName: '惠济区',
        },
        {
          cityId: '410122',
          cityName: '中牟县',
        },
        {
          cityId: '410181',
          cityName: '巩义市',
        },
        {
          cityId: '410182',
          cityName: '荥阳市',
        },
        {
          cityId: '410183',
          cityName: '新密市',
        },
        {
          cityId: '410184',
          cityName: '新郑市',
        },
        {
          cityId: '410185',
          cityName: '登封市',
        },
      ],
    },
    {
      开封市: [
        {
          cityId: '410200',
          cityName: '开封市',
        },
        {
          cityId: '410201',
          cityName: '市辖区',
        },
        {
          cityId: '410202',
          cityName: '龙亭区',
        },
        {
          cityId: '410203',
          cityName: '顺河回族区',
        },
        {
          cityId: '410204',
          cityName: '鼓楼区',
        },
        {
          cityId: '410205',
          cityName: '禹王台区',
        },
        {
          cityId: '410211',
          cityName: '金明区',
        },
        {
          cityId: '410221',
          cityName: '杞　县',
        },
        {
          cityId: '410222',
          cityName: '通许县',
        },
        {
          cityId: '410223',
          cityName: '尉氏县',
        },
        {
          cityId: '410224',
          cityName: '开封县',
        },
        {
          cityId: '410225',
          cityName: '兰考县',
        },
      ],
    },
    {
      洛阳市: [
        {
          cityId: '410300',
          cityName: '洛阳市',
        },
        {
          cityId: '410301',
          cityName: '市辖区',
        },
        {
          cityId: '410302',
          cityName: '老城区',
        },
        {
          cityId: '410303',
          cityName: '西工区',
        },
        {
          cityId: '410304',
          cityName: '瀍河回族区',
        },
        {
          cityId: '410305',
          cityName: '涧西区',
        },
        {
          cityId: '410306',
          cityName: '吉利区',
        },
        {
          cityId: '410311',
          cityName: '洛龙区',
        },
        {
          cityId: '410322',
          cityName: '孟津县',
        },
        {
          cityId: '410323',
          cityName: '新安县',
        },
        {
          cityId: '410324',
          cityName: '栾川县',
        },
        {
          cityId: '410325',
          cityName: '嵩　县',
        },
        {
          cityId: '410326',
          cityName: '汝阳县',
        },
        {
          cityId: '410327',
          cityName: '宜阳县',
        },
        {
          cityId: '410328',
          cityName: '洛宁县',
        },
        {
          cityId: '410329',
          cityName: '伊川县',
        },
        {
          cityId: '410381',
          cityName: '偃师市',
        },
      ],
    },
    {
      平顶山市: [
        {
          cityId: '410400',
          cityName: '平顶山市',
        },
        {
          cityId: '410401',
          cityName: '市辖区',
        },
        {
          cityId: '410402',
          cityName: '新华区',
        },
        {
          cityId: '410403',
          cityName: '卫东区',
        },
        {
          cityId: '410404',
          cityName: '石龙区',
        },
        {
          cityId: '410411',
          cityName: '湛河区',
        },
        {
          cityId: '410421',
          cityName: '宝丰县',
        },
        {
          cityId: '410422',
          cityName: '叶　县',
        },
        {
          cityId: '410423',
          cityName: '鲁山县',
        },
        {
          cityId: '410425',
          cityName: '郏　县',
        },
        {
          cityId: '410481',
          cityName: '舞钢市',
        },
        {
          cityId: '410482',
          cityName: '汝州市',
        },
      ],
    },
    {
      安阳市: [
        {
          cityId: '410500',
          cityName: '安阳市',
        },
        {
          cityId: '410501',
          cityName: '市辖区',
        },
        {
          cityId: '410502',
          cityName: '文峰区',
        },
        {
          cityId: '410503',
          cityName: '北关区',
        },
        {
          cityId: '410505',
          cityName: '殷都区',
        },
        {
          cityId: '410506',
          cityName: '龙安区',
        },
        {
          cityId: '410522',
          cityName: '安阳县',
        },
        {
          cityId: '410523',
          cityName: '汤阴县',
        },
        {
          cityId: '410526',
          cityName: '滑　县',
        },
        {
          cityId: '410527',
          cityName: '内黄县',
        },
        {
          cityId: '410581',
          cityName: '林州市',
        },
      ],
    },
    {
      鹤壁市: [
        {
          cityId: '410600',
          cityName: '鹤壁市',
        },
        {
          cityId: '410601',
          cityName: '市辖区',
        },
        {
          cityId: '410602',
          cityName: '鹤山区',
        },
        {
          cityId: '410603',
          cityName: '山城区',
        },
        {
          cityId: '410611',
          cityName: '淇滨区',
        },
        {
          cityId: '410621',
          cityName: '浚　县',
        },
        {
          cityId: '410622',
          cityName: '淇　县',
        },
      ],
    },
    {
      新乡市: [
        {
          cityId: '410700',
          cityName: '新乡市',
        },
        {
          cityId: '410701',
          cityName: '市辖区',
        },
        {
          cityId: '410702',
          cityName: '红旗区',
        },
        {
          cityId: '410703',
          cityName: '卫滨区',
        },
        {
          cityId: '410704',
          cityName: '凤泉区',
        },
        {
          cityId: '410711',
          cityName: '牧野区',
        },
        {
          cityId: '410721',
          cityName: '新乡县',
        },
        {
          cityId: '410724',
          cityName: '获嘉县',
        },
        {
          cityId: '410725',
          cityName: '原阳县',
        },
        {
          cityId: '410726',
          cityName: '延津县',
        },
        {
          cityId: '410727',
          cityName: '封丘县',
        },
        {
          cityId: '410728',
          cityName: '长垣县',
        },
        {
          cityId: '410781',
          cityName: '卫辉市',
        },
        {
          cityId: '410782',
          cityName: '辉县市',
        },
      ],
    },
    {
      焦作市: [
        {
          cityId: '410800',
          cityName: '焦作市',
        },
        {
          cityId: '410801',
          cityName: '市辖区',
        },
        {
          cityId: '410802',
          cityName: '解放区',
        },
        {
          cityId: '410803',
          cityName: '中站区',
        },
        {
          cityId: '410804',
          cityName: '马村区',
        },
        {
          cityId: '410811',
          cityName: '山阳区',
        },
        {
          cityId: '410821',
          cityName: '修武县',
        },
        {
          cityId: '410822',
          cityName: '博爱县',
        },
        {
          cityId: '410823',
          cityName: '武陟县',
        },
        {
          cityId: '410825',
          cityName: '温　县',
        },
        {
          cityId: '410882',
          cityName: '沁阳市',
        },
        {
          cityId: '410883',
          cityName: '孟州市',
        },
      ],
    },
    {
      濮阳市: [
        {
          cityId: '410900',
          cityName: '濮阳市',
        },
        {
          cityId: '410901',
          cityName: '市辖区',
        },
        {
          cityId: '410902',
          cityName: '华龙区',
        },
        {
          cityId: '410922',
          cityName: '清丰县',
        },
        {
          cityId: '410923',
          cityName: '南乐县',
        },
        {
          cityId: '410926',
          cityName: '范　县',
        },
        {
          cityId: '410927',
          cityName: '台前县',
        },
        {
          cityId: '410928',
          cityName: '濮阳县',
        },
      ],
    },
    {
      许昌市: [
        {
          cityId: '411000',
          cityName: '许昌市',
        },
        {
          cityId: '411001',
          cityName: '市辖区',
        },
        {
          cityId: '411002',
          cityName: '魏都区',
        },
        {
          cityId: '411023',
          cityName: '许昌县',
        },
        {
          cityId: '411024',
          cityName: '鄢陵县',
        },
        {
          cityId: '411025',
          cityName: '襄城县',
        },
        {
          cityId: '411081',
          cityName: '禹州市',
        },
        {
          cityId: '411082',
          cityName: '长葛市',
        },
      ],
    },
    {
      漯河市: [
        {
          cityId: '411100',
          cityName: '漯河市',
        },
        {
          cityId: '411101',
          cityName: '市辖区',
        },
        {
          cityId: '411102',
          cityName: '源汇区',
        },
        {
          cityId: '411103',
          cityName: '郾城区',
        },
        {
          cityId: '411104',
          cityName: '召陵区',
        },
        {
          cityId: '411121',
          cityName: '舞阳县',
        },
        {
          cityId: '411122',
          cityName: '临颍县',
        },
      ],
    },
    {
      三门峡市: [
        {
          cityId: '411200',
          cityName: '三门峡市',
        },
        {
          cityId: '411201',
          cityName: '市辖区',
        },
        {
          cityId: '411202',
          cityName: '湖滨区',
        },
        {
          cityId: '411221',
          cityName: '渑池县',
        },
        {
          cityId: '411222',
          cityName: '陕　县',
        },
        {
          cityId: '411224',
          cityName: '卢氏县',
        },
        {
          cityId: '411281',
          cityName: '义马市',
        },
        {
          cityId: '411282',
          cityName: '灵宝市',
        },
      ],
    },
    {
      南阳市: [
        {
          cityId: '411300',
          cityName: '南阳市',
        },
        {
          cityId: '411301',
          cityName: '市辖区',
        },
        {
          cityId: '411302',
          cityName: '宛城区',
        },
        {
          cityId: '411303',
          cityName: '卧龙区',
        },
        {
          cityId: '411321',
          cityName: '南召县',
        },
        {
          cityId: '411322',
          cityName: '方城县',
        },
        {
          cityId: '411323',
          cityName: '西峡县',
        },
        {
          cityId: '411324',
          cityName: '镇平县',
        },
        {
          cityId: '411325',
          cityName: '内乡县',
        },
        {
          cityId: '411326',
          cityName: '淅川县',
        },
        {
          cityId: '411327',
          cityName: '社旗县',
        },
        {
          cityId: '411328',
          cityName: '唐河县',
        },
        {
          cityId: '411329',
          cityName: '新野县',
        },
        {
          cityId: '411330',
          cityName: '桐柏县',
        },
        {
          cityId: '411381',
          cityName: '邓州市',
        },
      ],
    },
    {
      商丘市: [
        {
          cityId: '411400',
          cityName: '商丘市',
        },
        {
          cityId: '411401',
          cityName: '市辖区',
        },
        {
          cityId: '411402',
          cityName: '梁园区',
        },
        {
          cityId: '411403',
          cityName: '睢阳区',
        },
        {
          cityId: '411421',
          cityName: '民权县',
        },
        {
          cityId: '411422',
          cityName: '睢　县',
        },
        {
          cityId: '411423',
          cityName: '宁陵县',
        },
        {
          cityId: '411424',
          cityName: '柘城县',
        },
        {
          cityId: '411425',
          cityName: '虞城县',
        },
        {
          cityId: '411426',
          cityName: '夏邑县',
        },
        {
          cityId: '411481',
          cityName: '永城市',
        },
      ],
    },
    {
      信阳市: [
        {
          cityId: '411500',
          cityName: '信阳市',
        },
        {
          cityId: '411501',
          cityName: '市辖区',
        },
        {
          cityId: '411502',
          cityName: '浉河区',
        },
        {
          cityId: '411503',
          cityName: '平桥区',
        },
        {
          cityId: '411521',
          cityName: '罗山县',
        },
        {
          cityId: '411522',
          cityName: '光山县',
        },
        {
          cityId: '411523',
          cityName: '新　县',
        },
        {
          cityId: '411524',
          cityName: '商城县',
        },
        {
          cityId: '411525',
          cityName: '固始县',
        },
        {
          cityId: '411526',
          cityName: '潢川县',
        },
        {
          cityId: '411527',
          cityName: '淮滨县',
        },
        {
          cityId: '411528',
          cityName: '息　县',
        },
      ],
    },
    {
      周口市: [
        {
          cityId: '411600',
          cityName: '周口市',
        },
        {
          cityId: '411601',
          cityName: '市辖区',
        },
        {
          cityId: '411602',
          cityName: '川汇区',
        },
        {
          cityId: '411621',
          cityName: '扶沟县',
        },
        {
          cityId: '411622',
          cityName: '西华县',
        },
        {
          cityId: '411623',
          cityName: '商水县',
        },
        {
          cityId: '411624',
          cityName: '沈丘县',
        },
        {
          cityId: '411625',
          cityName: '郸城县',
        },
        {
          cityId: '411626',
          cityName: '淮阳县',
        },
        {
          cityId: '411627',
          cityName: '太康县',
        },
        {
          cityId: '411628',
          cityName: '鹿邑县',
        },
        {
          cityId: '411681',
          cityName: '项城市',
        },
      ],
    },
    {
      驻马店市: [
        {
          cityId: '411700',
          cityName: '驻马店市',
        },
        {
          cityId: '411701',
          cityName: '市辖区',
        },
        {
          cityId: '411702',
          cityName: '驿城区',
        },
        {
          cityId: '411721',
          cityName: '西平县',
        },
        {
          cityId: '411722',
          cityName: '上蔡县',
        },
        {
          cityId: '411723',
          cityName: '平舆县',
        },
        {
          cityId: '411724',
          cityName: '正阳县',
        },
        {
          cityId: '411725',
          cityName: '确山县',
        },
        {
          cityId: '411726',
          cityName: '泌阳县',
        },
        {
          cityId: '411727',
          cityName: '汝南县',
        },
        {
          cityId: '411728',
          cityName: '遂平县',
        },
        {
          cityId: '411729',
          cityName: '新蔡县',
        },
      ],
    },
    {
      市辖区: [
        {
          cityId: '419000',
          cityName: '省直辖县级行政区划',
        },
        {
          cityId: '419001',
          cityName: '济源市',
        },
      ],
    },
  ],
  湖北省: [
    {
      cityId: '420000',
      cityName: '湖北省',
    },
    {
      武汉市: [
        {
          cityId: '420100',
          cityName: '武汉市',
        },
        {
          cityId: '420101',
          cityName: '市辖区',
        },
        {
          cityId: '420102',
          cityName: '江岸区',
        },
        {
          cityId: '420103',
          cityName: '江汉区',
        },
        {
          cityId: '420104',
          cityName: '硚口区',
        },
        {
          cityId: '420105',
          cityName: '汉阳区',
        },
        {
          cityId: '420106',
          cityName: '武昌区',
        },
        {
          cityId: '420107',
          cityName: '青山区',
        },
        {
          cityId: '420111',
          cityName: '洪山区',
        },
        {
          cityId: '420112',
          cityName: '东西湖区',
        },
        {
          cityId: '420113',
          cityName: '汉南区',
        },
        {
          cityId: '420114',
          cityName: '蔡甸区',
        },
        {
          cityId: '420115',
          cityName: '江夏区',
        },
        {
          cityId: '420116',
          cityName: '黄陂区',
        },
        {
          cityId: '420117',
          cityName: '新洲区',
        },
      ],
    },
    {
      黄石市: [
        {
          cityId: '420200',
          cityName: '黄石市',
        },
        {
          cityId: '420201',
          cityName: '市辖区',
        },
        {
          cityId: '420202',
          cityName: '黄石港区',
        },
        {
          cityId: '420203',
          cityName: '西塞山区',
        },
        {
          cityId: '420204',
          cityName: '下陆区',
        },
        {
          cityId: '420205',
          cityName: '铁山区',
        },
        {
          cityId: '420222',
          cityName: '阳新县',
        },
        {
          cityId: '420281',
          cityName: '大冶市',
        },
      ],
    },
    {
      十堰市: [
        {
          cityId: '420300',
          cityName: '十堰市',
        },
        {
          cityId: '420301',
          cityName: '市辖区',
        },
        {
          cityId: '420302',
          cityName: '茅箭区',
        },
        {
          cityId: '420303',
          cityName: '张湾区',
        },
        {
          cityId: '420321',
          cityName: '郧　县',
        },
        {
          cityId: '420322',
          cityName: '郧西县',
        },
        {
          cityId: '420323',
          cityName: '竹山县',
        },
        {
          cityId: '420324',
          cityName: '竹溪县',
        },
        {
          cityId: '420325',
          cityName: '房　县',
        },
        {
          cityId: '420381',
          cityName: '丹江口市',
        },
      ],
    },
    {
      宜昌市: [
        {
          cityId: '420500',
          cityName: '宜昌市',
        },
        {
          cityId: '420501',
          cityName: '市辖区',
        },
        {
          cityId: '420502',
          cityName: '西陵区',
        },
        {
          cityId: '420503',
          cityName: '伍家岗区',
        },
        {
          cityId: '420504',
          cityName: '点军区',
        },
        {
          cityId: '420505',
          cityName: '猇亭区',
        },
        {
          cityId: '420506',
          cityName: '夷陵区',
        },
        {
          cityId: '420525',
          cityName: '远安县',
        },
        {
          cityId: '420526',
          cityName: '兴山县',
        },
        {
          cityId: '420527',
          cityName: '秭归县',
        },
        {
          cityId: '420528',
          cityName: '长阳土家族自治县',
        },
        {
          cityId: '420529',
          cityName: '五峰土家族自治县',
        },
        {
          cityId: '420581',
          cityName: '宜都市',
        },
        {
          cityId: '420582',
          cityName: '当阳市',
        },
        {
          cityId: '420583',
          cityName: '枝江市',
        },
      ],
    },
    {
      襄樊市: [
        {
          cityId: '420600',
          cityName: '襄樊市',
        },
        {
          cityId: '420601',
          cityName: '市辖区',
        },
        {
          cityId: '420602',
          cityName: '襄城区',
        },
        {
          cityId: '420606',
          cityName: '樊城区',
        },
        {
          cityId: '420607',
          cityName: '襄阳区',
        },
        {
          cityId: '420624',
          cityName: '南漳县',
        },
        {
          cityId: '420625',
          cityName: '谷城县',
        },
        {
          cityId: '420626',
          cityName: '保康县',
        },
        {
          cityId: '420682',
          cityName: '老河口市',
        },
        {
          cityId: '420683',
          cityName: '枣阳市',
        },
        {
          cityId: '420684',
          cityName: '宜城市',
        },
      ],
    },
    {
      鄂州市: [
        {
          cityId: '420700',
          cityName: '鄂州市',
        },
        {
          cityId: '420701',
          cityName: '市辖区',
        },
        {
          cityId: '420702',
          cityName: '梁子湖区',
        },
        {
          cityId: '420703',
          cityName: '华容区',
        },
        {
          cityId: '420704',
          cityName: '鄂城区',
        },
      ],
    },
    {
      荆门市: [
        {
          cityId: '420800',
          cityName: '荆门市',
        },
        {
          cityId: '420801',
          cityName: '市辖区',
        },
        {
          cityId: '420802',
          cityName: '东宝区',
        },
        {
          cityId: '420804',
          cityName: '掇刀区',
        },
        {
          cityId: '420821',
          cityName: '京山县',
        },
        {
          cityId: '420822',
          cityName: '沙洋县',
        },
        {
          cityId: '420881',
          cityName: '钟祥市',
        },
      ],
    },
    {
      孝感市: [
        {
          cityId: '420900',
          cityName: '孝感市',
        },
        {
          cityId: '420901',
          cityName: '市辖区',
        },
        {
          cityId: '420902',
          cityName: '孝南区',
        },
        {
          cityId: '420921',
          cityName: '孝昌县',
        },
        {
          cityId: '420922',
          cityName: '大悟县',
        },
        {
          cityId: '420923',
          cityName: '云梦县',
        },
        {
          cityId: '420981',
          cityName: '应城市',
        },
        {
          cityId: '420982',
          cityName: '安陆市',
        },
        {
          cityId: '420984',
          cityName: '汉川市',
        },
      ],
    },
    {
      荆州市: [
        {
          cityId: '421000',
          cityName: '荆州市',
        },
        {
          cityId: '421001',
          cityName: '市辖区',
        },
        {
          cityId: '421002',
          cityName: '沙市区',
        },
        {
          cityId: '421003',
          cityName: '荆州区',
        },
        {
          cityId: '421022',
          cityName: '公安县',
        },
        {
          cityId: '421023',
          cityName: '监利县',
        },
        {
          cityId: '421024',
          cityName: '江陵县',
        },
        {
          cityId: '421081',
          cityName: '石首市',
        },
        {
          cityId: '421083',
          cityName: '洪湖市',
        },
        {
          cityId: '421087',
          cityName: '松滋市',
        },
      ],
    },
    {
      黄冈市: [
        {
          cityId: '421100',
          cityName: '黄冈市',
        },
        {
          cityId: '421101',
          cityName: '市辖区',
        },
        {
          cityId: '421102',
          cityName: '黄州区',
        },
        {
          cityId: '421121',
          cityName: '团风县',
        },
        {
          cityId: '421122',
          cityName: '红安县',
        },
        {
          cityId: '421123',
          cityName: '罗田县',
        },
        {
          cityId: '421124',
          cityName: '英山县',
        },
        {
          cityId: '421125',
          cityName: '浠水县',
        },
        {
          cityId: '421126',
          cityName: '蕲春县',
        },
        {
          cityId: '421127',
          cityName: '黄梅县',
        },
        {
          cityId: '421181',
          cityName: '麻城市',
        },
        {
          cityId: '421182',
          cityName: '武穴市',
        },
      ],
    },
    {
      咸宁市: [
        {
          cityId: '421200',
          cityName: '咸宁市',
        },
        {
          cityId: '421201',
          cityName: '市辖区',
        },
        {
          cityId: '421202',
          cityName: '咸安区',
        },
        {
          cityId: '421221',
          cityName: '嘉鱼县',
        },
        {
          cityId: '421222',
          cityName: '通城县',
        },
        {
          cityId: '421223',
          cityName: '崇阳县',
        },
        {
          cityId: '421224',
          cityName: '通山县',
        },
        {
          cityId: '421281',
          cityName: '赤壁市',
        },
      ],
    },
    {
      随州市: [
        {
          cityId: '421300',
          cityName: '随州市',
        },
        {
          cityId: '421301',
          cityName: '市辖区',
        },
        {
          cityId: '421303',
          cityName: '曾都区',
        },
        {
          cityId: '421321',
          cityName: '随县',
        },
        {
          cityId: '421381',
          cityName: '广水市',
        },
      ],
    },
    {
      恩施土家族苗族自治州: [
        {
          cityId: '422800',
          cityName: '恩施土家族苗族自治州',
        },
        {
          cityId: '422801',
          cityName: '恩施市',
        },
        {
          cityId: '422802',
          cityName: '利川市',
        },
        {
          cityId: '422822',
          cityName: '建始县',
        },
        {
          cityId: '422823',
          cityName: '巴东县',
        },
        {
          cityId: '422825',
          cityName: '宣恩县',
        },
        {
          cityId: '422826',
          cityName: '咸丰县',
        },
        {
          cityId: '422827',
          cityName: '来凤县',
        },
        {
          cityId: '422828',
          cityName: '鹤峰县',
        },
      ],
    },
    {
      省直辖县级行政区划: [
        {
          cityId: '429000',
          cityName: '省直辖县级行政区划',
        },
        {
          cityId: '429004',
          cityName: '仙桃市',
        },
        {
          cityId: '429005',
          cityName: '潜江市',
        },
        {
          cityId: '429006',
          cityName: '天门市',
        },
        {
          cityId: '429021',
          cityName: '神农架林区',
        },
      ],
    },
  ],
  湖南省: [
    {
      cityId: '430000',
      cityName: '湖南省',
    },
    {
      长沙市: [
        {
          cityId: '430100',
          cityName: '长沙市',
        },
        {
          cityId: '430101',
          cityName: '市辖区',
        },
        {
          cityId: '430102',
          cityName: '芙蓉区',
        },
        {
          cityId: '430103',
          cityName: '天心区',
        },
        {
          cityId: '430104',
          cityName: '岳麓区',
        },
        {
          cityId: '430105',
          cityName: '开福区',
        },
        {
          cityId: '430111',
          cityName: '雨花区',
        },
        {
          cityId: '430121',
          cityName: '长沙县',
        },
        {
          cityId: '430122',
          cityName: '望城县',
        },
        {
          cityId: '430124',
          cityName: '宁乡县',
        },
        {
          cityId: '430181',
          cityName: '浏阳市',
        },
      ],
    },
    {
      株洲市: [
        {
          cityId: '430200',
          cityName: '株洲市',
        },
        {
          cityId: '430201',
          cityName: '市辖区',
        },
        {
          cityId: '430202',
          cityName: '荷塘区',
        },
        {
          cityId: '430203',
          cityName: '芦淞区',
        },
        {
          cityId: '430204',
          cityName: '石峰区',
        },
        {
          cityId: '430211',
          cityName: '天元区',
        },
        {
          cityId: '430221',
          cityName: '株洲县',
        },
        {
          cityId: '430223',
          cityName: '攸　县',
        },
        {
          cityId: '430224',
          cityName: '茶陵县',
        },
        {
          cityId: '430225',
          cityName: '炎陵县',
        },
        {
          cityId: '430281',
          cityName: '醴陵市',
        },
      ],
    },
    {
      湘潭市: [
        {
          cityId: '430300',
          cityName: '湘潭市',
        },
        {
          cityId: '430301',
          cityName: '市辖区',
        },
        {
          cityId: '430302',
          cityName: '雨湖区',
        },
        {
          cityId: '430304',
          cityName: '岳塘区',
        },
        {
          cityId: '430321',
          cityName: '湘潭县',
        },
        {
          cityId: '430381',
          cityName: '湘乡市',
        },
        {
          cityId: '430382',
          cityName: '韶山市',
        },
      ],
    },
    {
      衡阳市: [
        {
          cityId: '430400',
          cityName: '衡阳市',
        },
        {
          cityId: '430401',
          cityName: '市辖区',
        },
        {
          cityId: '430405',
          cityName: '珠晖区',
        },
        {
          cityId: '430406',
          cityName: '雁峰区',
        },
        {
          cityId: '430407',
          cityName: '石鼓区',
        },
        {
          cityId: '430408',
          cityName: '蒸湘区',
        },
        {
          cityId: '430412',
          cityName: '南岳区',
        },
        {
          cityId: '430421',
          cityName: '衡阳县',
        },
        {
          cityId: '430422',
          cityName: '衡南县',
        },
        {
          cityId: '430423',
          cityName: '衡山县',
        },
        {
          cityId: '430424',
          cityName: '衡东县',
        },
        {
          cityId: '430426',
          cityName: '祁东县',
        },
        {
          cityId: '430481',
          cityName: '耒阳市',
        },
        {
          cityId: '430482',
          cityName: '常宁市',
        },
      ],
    },
    {
      邵阳市: [
        {
          cityId: '430500',
          cityName: '邵阳市',
        },
        {
          cityId: '430501',
          cityName: '市辖区',
        },
        {
          cityId: '430502',
          cityName: '双清区',
        },
        {
          cityId: '430503',
          cityName: '大祥区',
        },
        {
          cityId: '430511',
          cityName: '北塔区',
        },
        {
          cityId: '430521',
          cityName: '邵东县',
        },
        {
          cityId: '430522',
          cityName: '新邵县',
        },
        {
          cityId: '430523',
          cityName: '邵阳县',
        },
        {
          cityId: '430524',
          cityName: '隆回县',
        },
        {
          cityId: '430525',
          cityName: '洞口县',
        },
        {
          cityId: '430527',
          cityName: '绥宁县',
        },
        {
          cityId: '430528',
          cityName: '新宁县',
        },
        {
          cityId: '430529',
          cityName: '城步苗族自治县',
        },
        {
          cityId: '430581',
          cityName: '武冈市',
        },
      ],
    },
    {
      岳阳市: [
        {
          cityId: '430600',
          cityName: '岳阳市',
        },
        {
          cityId: '430601',
          cityName: '市辖区',
        },
        {
          cityId: '430602',
          cityName: '岳阳楼区',
        },
        {
          cityId: '430603',
          cityName: '云溪区',
        },
        {
          cityId: '430611',
          cityName: '君山区',
        },
        {
          cityId: '430621',
          cityName: '岳阳县',
        },
        {
          cityId: '430623',
          cityName: '华容县',
        },
        {
          cityId: '430624',
          cityName: '湘阴县',
        },
        {
          cityId: '430626',
          cityName: '平江县',
        },
        {
          cityId: '430681',
          cityName: '汨罗市',
        },
        {
          cityId: '430682',
          cityName: '临湘市',
        },
      ],
    },
    {
      常德市: [
        {
          cityId: '430700',
          cityName: '常德市',
        },
        {
          cityId: '430701',
          cityName: '市辖区',
        },
        {
          cityId: '430702',
          cityName: '武陵区',
        },
        {
          cityId: '430703',
          cityName: '鼎城区',
        },
        {
          cityId: '430721',
          cityName: '安乡县',
        },
        {
          cityId: '430722',
          cityName: '汉寿县',
        },
        {
          cityId: '430723',
          cityName: '澧　县',
        },
        {
          cityId: '430724',
          cityName: '临澧县',
        },
        {
          cityId: '430725',
          cityName: '桃源县',
        },
        {
          cityId: '430726',
          cityName: '石门县',
        },
        {
          cityId: '430781',
          cityName: '津市市',
        },
      ],
    },
    {
      张家界市: [
        {
          cityId: '430800',
          cityName: '张家界市',
        },
        {
          cityId: '430801',
          cityName: '市辖区',
        },
        {
          cityId: '430802',
          cityName: '永定区',
        },
        {
          cityId: '430811',
          cityName: '武陵源区',
        },
        {
          cityId: '430821',
          cityName: '慈利县',
        },
        {
          cityId: '430822',
          cityName: '桑植县',
        },
      ],
    },
    {
      益阳市: [
        {
          cityId: '430900',
          cityName: '益阳市',
        },
        {
          cityId: '430901',
          cityName: '市辖区',
        },
        {
          cityId: '430902',
          cityName: '资阳区',
        },
        {
          cityId: '430903',
          cityName: '赫山区',
        },
        {
          cityId: '430921',
          cityName: '南　县',
        },
        {
          cityId: '430922',
          cityName: '桃江县',
        },
        {
          cityId: '430923',
          cityName: '安化县',
        },
        {
          cityId: '430981',
          cityName: '沅江市',
        },
      ],
    },
    {
      郴州市: [
        {
          cityId: '431000',
          cityName: '郴州市',
        },
        {
          cityId: '431001',
          cityName: '市辖区',
        },
        {
          cityId: '431002',
          cityName: '北湖区',
        },
        {
          cityId: '431003',
          cityName: '苏仙区',
        },
        {
          cityId: '431021',
          cityName: '桂阳县',
        },
        {
          cityId: '431022',
          cityName: '宜章县',
        },
        {
          cityId: '431023',
          cityName: '永兴县',
        },
        {
          cityId: '431024',
          cityName: '嘉禾县',
        },
        {
          cityId: '431025',
          cityName: '临武县',
        },
        {
          cityId: '431026',
          cityName: '汝城县',
        },
        {
          cityId: '431027',
          cityName: '桂东县',
        },
        {
          cityId: '431028',
          cityName: '安仁县',
        },
        {
          cityId: '431081',
          cityName: '资兴市',
        },
      ],
    },
    {
      永州市: [
        {
          cityId: '431100',
          cityName: '永州市',
        },
        {
          cityId: '431101',
          cityName: '市辖区',
        },
        {
          cityId: '431102',
          cityName: '零陵区',
        },
        {
          cityId: '431103',
          cityName: '冷水滩区',
        },
        {
          cityId: '431121',
          cityName: '祁阳县',
        },
        {
          cityId: '431122',
          cityName: '东安县',
        },
        {
          cityId: '431123',
          cityName: '双牌县',
        },
        {
          cityId: '431124',
          cityName: '道　县',
        },
        {
          cityId: '431125',
          cityName: '江永县',
        },
        {
          cityId: '431126',
          cityName: '宁远县',
        },
        {
          cityId: '431127',
          cityName: '蓝山县',
        },
        {
          cityId: '431128',
          cityName: '新田县',
        },
        {
          cityId: '431129',
          cityName: '江华瑶族自治县',
        },
      ],
    },
    {
      怀化市: [
        {
          cityId: '431200',
          cityName: '怀化市',
        },
        {
          cityId: '431201',
          cityName: '市辖区',
        },
        {
          cityId: '431202',
          cityName: '鹤城区',
        },
        {
          cityId: '431221',
          cityName: '中方县',
        },
        {
          cityId: '431222',
          cityName: '沅陵县',
        },
        {
          cityId: '431223',
          cityName: '辰溪县',
        },
        {
          cityId: '431224',
          cityName: '溆浦县',
        },
        {
          cityId: '431225',
          cityName: '会同县',
        },
        {
          cityId: '431226',
          cityName: '麻阳苗族自治县',
        },
        {
          cityId: '431227',
          cityName: '新晃侗族自治县',
        },
        {
          cityId: '431228',
          cityName: '芷江侗族自治县',
        },
        {
          cityId: '431229',
          cityName: '靖州苗族侗族自治县',
        },
        {
          cityId: '431230',
          cityName: '通道侗族自治县',
        },
        {
          cityId: '431281',
          cityName: '洪江市',
        },
      ],
    },
    {
      娄底市: [
        {
          cityId: '431300',
          cityName: '娄底市',
        },
        {
          cityId: '431301',
          cityName: '市辖区',
        },
        {
          cityId: '431302',
          cityName: '娄星区',
        },
        {
          cityId: '431321',
          cityName: '双峰县',
        },
        {
          cityId: '431322',
          cityName: '新化县',
        },
        {
          cityId: '431381',
          cityName: '冷水江市',
        },
        {
          cityId: '431382',
          cityName: '涟源市',
        },
      ],
    },
    {
      湘西土家族苗族自治州: [
        {
          cityId: '433100',
          cityName: '湘西土家族苗族自治州',
        },
        {
          cityId: '433101',
          cityName: '吉首市',
        },
        {
          cityId: '433122',
          cityName: '泸溪县',
        },
        {
          cityId: '433123',
          cityName: '凤凰县',
        },
        {
          cityId: '433124',
          cityName: '花垣县',
        },
        {
          cityId: '433125',
          cityName: '保靖县',
        },
        {
          cityId: '433126',
          cityName: '古丈县',
        },
        {
          cityId: '433127',
          cityName: '永顺县',
        },
        {
          cityId: '433130',
          cityName: '龙山县',
        },
      ],
    },
  ],
  广东省: [
    {
      cityId: '440000',
      cityName: '广东省',
    },
    {
      广州市: [
        {
          cityId: '440100',
          cityName: '广州市',
        },
        {
          cityId: '440101',
          cityName: '市辖区',
        },
        {
          cityId: '440103',
          cityName: '荔湾区',
        },
        {
          cityId: '440104',
          cityName: '越秀区',
        },
        {
          cityId: '440105',
          cityName: '海珠区',
        },
        {
          cityId: '440106',
          cityName: '天河区',
        },
        {
          cityId: '440111',
          cityName: '白云区',
        },
        {
          cityId: '440112',
          cityName: '黄埔区',
        },
        {
          cityId: '440113',
          cityName: '番禺区',
        },
        {
          cityId: '440114',
          cityName: '花都区',
        },
        {
          cityId: '440115',
          cityName: '南沙区',
        },
        {
          cityId: '440116',
          cityName: '萝岗区',
        },
        {
          cityId: '440183',
          cityName: '增城市',
        },
        {
          cityId: '440184',
          cityName: '从化市',
        },
      ],
    },
    {
      韶关市: [
        {
          cityId: '440200',
          cityName: '韶关市',
        },
        {
          cityId: '440201',
          cityName: '市辖区',
        },
        {
          cityId: '440203',
          cityName: '武江区',
        },
        {
          cityId: '440204',
          cityName: '浈江区',
        },
        {
          cityId: '440205',
          cityName: '曲江区',
        },
        {
          cityId: '440222',
          cityName: '始兴县',
        },
        {
          cityId: '440224',
          cityName: '仁化县',
        },
        {
          cityId: '440229',
          cityName: '翁源县',
        },
        {
          cityId: '440232',
          cityName: '乳源瑶族自治县',
        },
        {
          cityId: '440233',
          cityName: '新丰县',
        },
        {
          cityId: '440281',
          cityName: '乐昌市',
        },
        {
          cityId: '440282',
          cityName: '南雄市',
        },
      ],
    },
    {
      深圳市: [
        {
          cityId: '440300',
          cityName: '深圳市',
        },
        {
          cityId: '440301',
          cityName: '市辖区',
        },
        {
          cityId: '440303',
          cityName: '罗湖区',
        },
        {
          cityId: '440304',
          cityName: '福田区',
        },
        {
          cityId: '440305',
          cityName: '南山区',
        },
        {
          cityId: '440306',
          cityName: '宝安区',
        },
        {
          cityId: '440307',
          cityName: '龙岗区',
        },
        {
          cityId: '440308',
          cityName: '盐田区',
        },
      ],
    },
    {
      珠海市: [
        {
          cityId: '440400',
          cityName: '珠海市',
        },
        {
          cityId: '440401',
          cityName: '市辖区',
        },
        {
          cityId: '440402',
          cityName: '香洲区',
        },
        {
          cityId: '440403',
          cityName: '斗门区',
        },
        {
          cityId: '440404',
          cityName: '金湾区',
        },
      ],
    },
    {
      汕头市: [
        {
          cityId: '440500',
          cityName: '汕头市',
        },
        {
          cityId: '440501',
          cityName: '市辖区',
        },
        {
          cityId: '440507',
          cityName: '龙湖区',
        },
        {
          cityId: '440511',
          cityName: '金平区',
        },
        {
          cityId: '440512',
          cityName: '濠江区',
        },
        {
          cityId: '440513',
          cityName: '潮阳区',
        },
        {
          cityId: '440514',
          cityName: '潮南区',
        },
        {
          cityId: '440515',
          cityName: '澄海区',
        },
        {
          cityId: '440523',
          cityName: '南澳县',
        },
      ],
    },
    {
      佛山市: [
        {
          cityId: '440600',
          cityName: '佛山市',
        },
        {
          cityId: '440601',
          cityName: '市辖区',
        },
        {
          cityId: '440604',
          cityName: '禅城区',
        },
        {
          cityId: '440605',
          cityName: '南海区',
        },
        {
          cityId: '440606',
          cityName: '顺德区',
        },
        {
          cityId: '440607',
          cityName: '三水区',
        },
        {
          cityId: '440608',
          cityName: '高明区',
        },
      ],
    },
    {
      江门市: [
        {
          cityId: '440700',
          cityName: '江门市',
        },
        {
          cityId: '440701',
          cityName: '市辖区',
        },
        {
          cityId: '440703',
          cityName: '蓬江区',
        },
        {
          cityId: '440704',
          cityName: '江海区',
        },
        {
          cityId: '440705',
          cityName: '新会区',
        },
        {
          cityId: '440781',
          cityName: '台山市',
        },
        {
          cityId: '440783',
          cityName: '开平市',
        },
        {
          cityId: '440784',
          cityName: '鹤山市',
        },
        {
          cityId: '440785',
          cityName: '恩平市',
        },
      ],
    },
    {
      湛江市: [
        {
          cityId: '440800',
          cityName: '湛江市',
        },
        {
          cityId: '440801',
          cityName: '市辖区',
        },
        {
          cityId: '440802',
          cityName: '赤坎区',
        },
        {
          cityId: '440803',
          cityName: '霞山区',
        },
        {
          cityId: '440804',
          cityName: '坡头区',
        },
        {
          cityId: '440811',
          cityName: '麻章区',
        },
        {
          cityId: '440823',
          cityName: '遂溪县',
        },
        {
          cityId: '440825',
          cityName: '徐闻县',
        },
        {
          cityId: '440881',
          cityName: '廉江市',
        },
        {
          cityId: '440882',
          cityName: '雷州市',
        },
        {
          cityId: '440883',
          cityName: '吴川市',
        },
      ],
    },
    {
      茂名市: [
        {
          cityId: '440900',
          cityName: '茂名市',
        },
        {
          cityId: '440901',
          cityName: '市辖区',
        },
        {
          cityId: '440902',
          cityName: '茂南区',
        },
        {
          cityId: '440903',
          cityName: '茂港区',
        },
        {
          cityId: '440923',
          cityName: '电白县',
        },
        {
          cityId: '440981',
          cityName: '高州市',
        },
        {
          cityId: '440982',
          cityName: '化州市',
        },
        {
          cityId: '440983',
          cityName: '信宜市',
        },
      ],
    },
    {
      肇庆市: [
        {
          cityId: '441200',
          cityName: '肇庆市',
        },
        {
          cityId: '441201',
          cityName: '市辖区',
        },
        {
          cityId: '441202',
          cityName: '端州区',
        },
        {
          cityId: '441203',
          cityName: '鼎湖区',
        },
        {
          cityId: '441223',
          cityName: '广宁县',
        },
        {
          cityId: '441224',
          cityName: '怀集县',
        },
        {
          cityId: '441225',
          cityName: '封开县',
        },
        {
          cityId: '441226',
          cityName: '德庆县',
        },
        {
          cityId: '441283',
          cityName: '高要市',
        },
        {
          cityId: '441284',
          cityName: '四会市',
        },
      ],
    },
    {
      惠州市: [
        {
          cityId: '441300',
          cityName: '惠州市',
        },
        {
          cityId: '441301',
          cityName: '市辖区',
        },
        {
          cityId: '441302',
          cityName: '惠城区',
        },
        {
          cityId: '441303',
          cityName: '惠阳区',
        },
        {
          cityId: '441322',
          cityName: '博罗县',
        },
        {
          cityId: '441323',
          cityName: '惠东县',
        },
        {
          cityId: '441324',
          cityName: '龙门县',
        },
      ],
    },
    {
      梅州市: [
        {
          cityId: '441400',
          cityName: '梅州市',
        },
        {
          cityId: '441401',
          cityName: '市辖区',
        },
        {
          cityId: '441402',
          cityName: '梅江区',
        },
        {
          cityId: '441421',
          cityName: '梅　县',
        },
        {
          cityId: '441422',
          cityName: '大埔县',
        },
        {
          cityId: '441423',
          cityName: '丰顺县',
        },
        {
          cityId: '441424',
          cityName: '五华县',
        },
        {
          cityId: '441426',
          cityName: '平远县',
        },
        {
          cityId: '441427',
          cityName: '蕉岭县',
        },
        {
          cityId: '441481',
          cityName: '兴宁市',
        },
      ],
    },
    {
      汕尾市: [
        {
          cityId: '441500',
          cityName: '汕尾市',
        },
        {
          cityId: '441501',
          cityName: '市辖区',
        },
        {
          cityId: '441502',
          cityName: '城　区',
        },
        {
          cityId: '441521',
          cityName: '海丰县',
        },
        {
          cityId: '441523',
          cityName: '陆河县',
        },
        {
          cityId: '441581',
          cityName: '陆丰市',
        },
      ],
    },
    {
      河源市: [
        {
          cityId: '441600',
          cityName: '河源市',
        },
        {
          cityId: '441601',
          cityName: '市辖区',
        },
        {
          cityId: '441602',
          cityName: '源城区',
        },
        {
          cityId: '441621',
          cityName: '紫金县',
        },
        {
          cityId: '441622',
          cityName: '龙川县',
        },
        {
          cityId: '441623',
          cityName: '连平县',
        },
        {
          cityId: '441624',
          cityName: '和平县',
        },
        {
          cityId: '441625',
          cityName: '东源县',
        },
      ],
    },
    {
      阳江市: [
        {
          cityId: '441700',
          cityName: '阳江市',
        },
        {
          cityId: '441701',
          cityName: '市辖区',
        },
        {
          cityId: '441702',
          cityName: '江城区',
        },
        {
          cityId: '441721',
          cityName: '阳西县',
        },
        {
          cityId: '441723',
          cityName: '阳东县',
        },
        {
          cityId: '441781',
          cityName: '阳春市',
        },
      ],
    },
    {
      清远市: [
        {
          cityId: '441800',
          cityName: '清远市',
        },
        {
          cityId: '441801',
          cityName: '市辖区',
        },
        {
          cityId: '441802',
          cityName: '清城区',
        },
        {
          cityId: '441821',
          cityName: '佛冈县',
        },
        {
          cityId: '441823',
          cityName: '阳山县',
        },
        {
          cityId: '441825',
          cityName: '连山壮族瑶族自治县',
        },
        {
          cityId: '441826',
          cityName: '连南瑶族自治县',
        },
        {
          cityId: '441827',
          cityName: '清新县',
        },
        {
          cityId: '441881',
          cityName: '英德市',
        },
        {
          cityId: '441882',
          cityName: '连州市',
        },
      ],
    },
    {
      东莞市: [
        {
          cityId: '441900',
          cityName: '东莞市',
        },
      ],
    },
    {
      中山市: [
        {
          cityId: '442000',
          cityName: '中山市',
        },
      ],
    },
    {
      潮州市: [
        {
          cityId: '445100',
          cityName: '潮州市',
        },
        {
          cityId: '445101',
          cityName: '市辖区',
        },
        {
          cityId: '445102',
          cityName: '湘桥区',
        },
        {
          cityId: '445121',
          cityName: '潮安县',
        },
        {
          cityId: '445122',
          cityName: '饶平县',
        },
      ],
    },
    {
      揭阳市: [
        {
          cityId: '445200',
          cityName: '揭阳市',
        },
        {
          cityId: '445201',
          cityName: '市辖区',
        },
        {
          cityId: '445202',
          cityName: '榕城区',
        },
        {
          cityId: '445221',
          cityName: '揭东县',
        },
        {
          cityId: '445222',
          cityName: '揭西县',
        },
        {
          cityId: '445224',
          cityName: '惠来县',
        },
        {
          cityId: '445281',
          cityName: '普宁市',
        },
      ],
    },
    {
      云浮市: [
        {
          cityId: '445300',
          cityName: '云浮市',
        },
        {
          cityId: '445301',
          cityName: '市辖区',
        },
        {
          cityId: '445302',
          cityName: '云城区',
        },
        {
          cityId: '445321',
          cityName: '新兴县',
        },
        {
          cityId: '445322',
          cityName: '郁南县',
        },
        {
          cityId: '445323',
          cityName: '云安县',
        },
        {
          cityId: '445381',
          cityName: '罗定市',
        },
      ],
    },
  ],
  广西壮族自治区: [
    {
      cityId: '450000',
      cityName: '广西壮族自治区',
    },
    {
      南宁市: [
        {
          cityId: '450100',
          cityName: '南宁市',
        },
        {
          cityId: '450101',
          cityName: '市辖区',
        },
        {
          cityId: '450102',
          cityName: '兴宁区',
        },
        {
          cityId: '450103',
          cityName: '青秀区',
        },
        {
          cityId: '450105',
          cityName: '江南区',
        },
        {
          cityId: '450107',
          cityName: '西乡塘区',
        },
        {
          cityId: '450108',
          cityName: '良庆区',
        },
        {
          cityId: '450109',
          cityName: '邕宁区',
        },
        {
          cityId: '450122',
          cityName: '武鸣县',
        },
        {
          cityId: '450123',
          cityName: '隆安县',
        },
        {
          cityId: '450124',
          cityName: '马山县',
        },
        {
          cityId: '450125',
          cityName: '上林县',
        },
        {
          cityId: '450126',
          cityName: '宾阳县',
        },
        {
          cityId: '450127',
          cityName: '横　县',
        },
      ],
    },
    {
      柳州市: [
        {
          cityId: '450200',
          cityName: '柳州市',
        },
        {
          cityId: '450201',
          cityName: '市辖区',
        },
        {
          cityId: '450202',
          cityName: '城中区',
        },
        {
          cityId: '450203',
          cityName: '鱼峰区',
        },
        {
          cityId: '450204',
          cityName: '柳南区',
        },
        {
          cityId: '450205',
          cityName: '柳北区',
        },
        {
          cityId: '450221',
          cityName: '柳江县',
        },
        {
          cityId: '450222',
          cityName: '柳城县',
        },
        {
          cityId: '450223',
          cityName: '鹿寨县',
        },
        {
          cityId: '450224',
          cityName: '融安县',
        },
        {
          cityId: '450225',
          cityName: '融水苗族自治县',
        },
        {
          cityId: '450226',
          cityName: '三江侗族自治县',
        },
      ],
    },
    {
      桂林市: [
        {
          cityId: '450300',
          cityName: '桂林市',
        },
        {
          cityId: '450301',
          cityName: '市辖区',
        },
        {
          cityId: '450302',
          cityName: '秀峰区',
        },
        {
          cityId: '450303',
          cityName: '叠彩区',
        },
        {
          cityId: '450304',
          cityName: '象山区',
        },
        {
          cityId: '450305',
          cityName: '七星区',
        },
        {
          cityId: '450311',
          cityName: '雁山区',
        },
        {
          cityId: '450321',
          cityName: '阳朔县',
        },
        {
          cityId: '450322',
          cityName: '临桂县',
        },
        {
          cityId: '450323',
          cityName: '灵川县',
        },
        {
          cityId: '450324',
          cityName: '全州县',
        },
        {
          cityId: '450325',
          cityName: '兴安县',
        },
        {
          cityId: '450326',
          cityName: '永福县',
        },
        {
          cityId: '450327',
          cityName: '灌阳县',
        },
        {
          cityId: '450328',
          cityName: '龙胜各族自治县',
        },
        {
          cityId: '450329',
          cityName: '资源县',
        },
        {
          cityId: '450330',
          cityName: '平乐县',
        },
        {
          cityId: '450331',
          cityName: '荔蒲县',
        },
        {
          cityId: '450332',
          cityName: '恭城瑶族自治县',
        },
      ],
    },
    {
      梧州市: [
        {
          cityId: '450400',
          cityName: '梧州市',
        },
        {
          cityId: '450401',
          cityName: '市辖区',
        },
        {
          cityId: '450403',
          cityName: '万秀区',
        },
        {
          cityId: '450404',
          cityName: '蝶山区',
        },
        {
          cityId: '450405',
          cityName: '长洲区',
        },
        {
          cityId: '450421',
          cityName: '苍梧县',
        },
        {
          cityId: '450422',
          cityName: '藤　县',
        },
        {
          cityId: '450423',
          cityName: '蒙山县',
        },
        {
          cityId: '450481',
          cityName: '岑溪市',
        },
      ],
    },
    {
      北海市: [
        {
          cityId: '450500',
          cityName: '北海市',
        },
        {
          cityId: '450501',
          cityName: '市辖区',
        },
        {
          cityId: '450502',
          cityName: '海城区',
        },
        {
          cityId: '450503',
          cityName: '银海区',
        },
        {
          cityId: '450512',
          cityName: '铁山港区',
        },
        {
          cityId: '450521',
          cityName: '合浦县',
        },
      ],
    },
    {
      防城港市: [
        {
          cityId: '450600',
          cityName: '防城港市',
        },
        {
          cityId: '450601',
          cityName: '市辖区',
        },
        {
          cityId: '450602',
          cityName: '港口区',
        },
        {
          cityId: '450603',
          cityName: '防城区',
        },
        {
          cityId: '450621',
          cityName: '上思县',
        },
        {
          cityId: '450681',
          cityName: '东兴市',
        },
      ],
    },
    {
      钦州市: [
        {
          cityId: '450700',
          cityName: '钦州市',
        },
        {
          cityId: '450701',
          cityName: '市辖区',
        },
        {
          cityId: '450702',
          cityName: '钦南区',
        },
        {
          cityId: '450703',
          cityName: '钦北区',
        },
        {
          cityId: '450721',
          cityName: '灵山县',
        },
        {
          cityId: '450722',
          cityName: '浦北县',
        },
      ],
    },
    {
      贵港市: [
        {
          cityId: '450800',
          cityName: '贵港市',
        },
        {
          cityId: '450801',
          cityName: '市辖区',
        },
        {
          cityId: '450802',
          cityName: '港北区',
        },
        {
          cityId: '450803',
          cityName: '港南区',
        },
        {
          cityId: '450804',
          cityName: '覃塘区',
        },
        {
          cityId: '450821',
          cityName: '平南县',
        },
        {
          cityId: '450881',
          cityName: '桂平市',
        },
      ],
    },
    {
      玉林市: [
        {
          cityId: '450900',
          cityName: '玉林市',
        },
        {
          cityId: '450901',
          cityName: '市辖区',
        },
        {
          cityId: '450902',
          cityName: '玉州区',
        },
        {
          cityId: '450921',
          cityName: '容　县',
        },
        {
          cityId: '450922',
          cityName: '陆川县',
        },
        {
          cityId: '450923',
          cityName: '博白县',
        },
        {
          cityId: '450924',
          cityName: '兴业县',
        },
        {
          cityId: '450981',
          cityName: '北流市',
        },
      ],
    },
    {
      百色市: [
        {
          cityId: '451000',
          cityName: '百色市',
        },
        {
          cityId: '451001',
          cityName: '市辖区',
        },
        {
          cityId: '451002',
          cityName: '右江区',
        },
        {
          cityId: '451021',
          cityName: '田阳县',
        },
        {
          cityId: '451022',
          cityName: '田东县',
        },
        {
          cityId: '451023',
          cityName: '平果县',
        },
        {
          cityId: '451024',
          cityName: '德保县',
        },
        {
          cityId: '451025',
          cityName: '靖西县',
        },
        {
          cityId: '451026',
          cityName: '那坡县',
        },
        {
          cityId: '451027',
          cityName: '凌云县',
        },
        {
          cityId: '451028',
          cityName: '乐业县',
        },
        {
          cityId: '451029',
          cityName: '田林县',
        },
        {
          cityId: '451030',
          cityName: '西林县',
        },
        {
          cityId: '451031',
          cityName: '隆林各族自治县',
        },
      ],
    },
    {
      贺州市: [
        {
          cityId: '451100',
          cityName: '贺州市',
        },
        {
          cityId: '451101',
          cityName: '市辖区',
        },
        {
          cityId: '451102',
          cityName: '八步区',
        },
        {
          cityId: '451121',
          cityName: '昭平县',
        },
        {
          cityId: '451122',
          cityName: '钟山县',
        },
        {
          cityId: '451123',
          cityName: '富川瑶族自治县',
        },
      ],
    },
    {
      河池市: [
        {
          cityId: '451200',
          cityName: '河池市',
        },
        {
          cityId: '451201',
          cityName: '市辖区',
        },
        {
          cityId: '451202',
          cityName: '金城江区',
        },
        {
          cityId: '451221',
          cityName: '南丹县',
        },
        {
          cityId: '451222',
          cityName: '天峨县',
        },
        {
          cityId: '451223',
          cityName: '凤山县',
        },
        {
          cityId: '451224',
          cityName: '东兰县',
        },
        {
          cityId: '451225',
          cityName: '罗城仫佬族自治县',
        },
        {
          cityId: '451226',
          cityName: '环江毛南族自治县',
        },
        {
          cityId: '451227',
          cityName: '巴马瑶族自治县',
        },
        {
          cityId: '451228',
          cityName: '都安瑶族自治县',
        },
        {
          cityId: '451229',
          cityName: '大化瑶族自治县',
        },
        {
          cityId: '451281',
          cityName: '宜州市',
        },
      ],
    },
    {
      来宾市: [
        {
          cityId: '451300',
          cityName: '来宾市',
        },
        {
          cityId: '451301',
          cityName: '市辖区',
        },
        {
          cityId: '451302',
          cityName: '兴宾区',
        },
        {
          cityId: '451321',
          cityName: '忻城县',
        },
        {
          cityId: '451322',
          cityName: '象州县',
        },
        {
          cityId: '451323',
          cityName: '武宣县',
        },
        {
          cityId: '451324',
          cityName: '金秀瑶族自治县',
        },
        {
          cityId: '451381',
          cityName: '合山市',
        },
      ],
    },
    {
      崇左市: [
        {
          cityId: '451400',
          cityName: '崇左市',
        },
        {
          cityId: '451401',
          cityName: '市辖区',
        },
        {
          cityId: '451402',
          cityName: '江洲区',
        },
        {
          cityId: '451421',
          cityName: '扶绥县',
        },
        {
          cityId: '451422',
          cityName: '宁明县',
        },
        {
          cityId: '451423',
          cityName: '龙州县',
        },
        {
          cityId: '451424',
          cityName: '大新县',
        },
        {
          cityId: '451425',
          cityName: '天等县',
        },
        {
          cityId: '451481',
          cityName: '凭祥市',
        },
      ],
    },
  ],
  海南省: [
    {
      cityId: '460000',
      cityName: '海南省',
    },
    {
      海口市: [
        {
          cityId: '460100',
          cityName: '海口市',
        },
        {
          cityId: '460101',
          cityName: '市辖区',
        },
        {
          cityId: '460105',
          cityName: '秀英区',
        },
        {
          cityId: '460106',
          cityName: '龙华区',
        },
        {
          cityId: '460107',
          cityName: '琼山区',
        },
        {
          cityId: '460108',
          cityName: '美兰区',
        },
      ],
    },
    {
      三亚市: [
        {
          cityId: '460200',
          cityName: '三亚市',
        },
        {
          cityId: '460201',
          cityName: '市辖区',
        },
      ],
    },
    {
      省直辖县级行政区划: [
        {
          cityId: '469000',
          cityName: '省直辖县级行政区划',
        },
        {
          cityId: '469001',
          cityName: '五指山市',
        },
        {
          cityId: '469002',
          cityName: '琼海市',
        },
        {
          cityId: '469003',
          cityName: '儋州市',
        },
        {
          cityId: '469005',
          cityName: '文昌市',
        },
        {
          cityId: '469006',
          cityName: '万宁市',
        },
        {
          cityId: '469007',
          cityName: '东方市',
        },
        {
          cityId: '469021',
          cityName: '定安县',
        },
        {
          cityId: '469022',
          cityName: '屯昌县',
        },
        {
          cityId: '469023',
          cityName: '澄迈县',
        },
        {
          cityId: '469024',
          cityName: '临高县',
        },
        {
          cityId: '469025',
          cityName: '白沙黎族自治县',
        },
        {
          cityId: '469026',
          cityName: '昌江黎族自治县',
        },
        {
          cityId: '469027',
          cityName: '乐东黎族自治县',
        },
        {
          cityId: '469028',
          cityName: '陵水黎族自治县',
        },
        {
          cityId: '469029',
          cityName: '保亭黎族苗族自治县',
        },
        {
          cityId: '469030',
          cityName: '琼中黎族苗族自治县',
        },
        {
          cityId: '469031',
          cityName: '西沙群岛',
        },
        {
          cityId: '469032',
          cityName: '南沙群岛',
        },
        {
          cityId: '469033',
          cityName: '中沙群岛的岛礁及其海域',
        },
      ],
    },
  ],
  重庆市: [
    {
      cityId: '500000',
      cityName: '重庆市',
    },
    {
      市辖区: [
        {
          cityId: '500100',
          cityName: '市辖区',
        },
        {
          cityId: '500101',
          cityName: '万州区',
        },
        {
          cityId: '500102',
          cityName: '涪陵区',
        },
        {
          cityId: '500103',
          cityName: '渝中区',
        },
        {
          cityId: '500104',
          cityName: '大渡口区',
        },
        {
          cityId: '500105',
          cityName: '江北区',
        },
        {
          cityId: '500106',
          cityName: '沙坪坝区',
        },
        {
          cityId: '500107',
          cityName: '九龙坡区',
        },
        {
          cityId: '500108',
          cityName: '南岸区',
        },
        {
          cityId: '500109',
          cityName: '北碚区',
        },
        {
          cityId: '500110',
          cityName: '万盛区',
        },
        {
          cityId: '500111',
          cityName: '双桥区',
        },
        {
          cityId: '500112',
          cityName: '渝北区',
        },
        {
          cityId: '500113',
          cityName: '巴南区',
        },
        {
          cityId: '500114',
          cityName: '黔江区',
        },
        {
          cityId: '500115',
          cityName: '长寿区',
        },
        {
          cityId: '500116',
          cityName: '江津区',
        },
        {
          cityId: '500117',
          cityName: '合川区',
        },
        {
          cityId: '500118',
          cityName: '永川区',
        },
        {
          cityId: '500119',
          cityName: '南川区',
        },
      ],
    },
    {
      县: [
        {
          cityId: '500200',
          cityName: '县',
        },
        {
          cityId: '500222',
          cityName: '綦江县',
        },
        {
          cityId: '500223',
          cityName: '潼南县',
        },
        {
          cityId: '500224',
          cityName: '铜梁县',
        },
        {
          cityId: '500225',
          cityName: '大足县',
        },
        {
          cityId: '500226',
          cityName: '荣昌县',
        },
        {
          cityId: '500227',
          cityName: '璧山县',
        },
        {
          cityId: '500228',
          cityName: '梁平县',
        },
        {
          cityId: '500229',
          cityName: '城口县',
        },
        {
          cityId: '500230',
          cityName: '丰都县',
        },
        {
          cityId: '500231',
          cityName: '垫江县',
        },
        {
          cityId: '500232',
          cityName: '武隆县',
        },
        {
          cityId: '500233',
          cityName: '忠　县',
        },
        {
          cityId: '500234',
          cityName: '开　县',
        },
        {
          cityId: '500235',
          cityName: '云阳县',
        },
        {
          cityId: '500236',
          cityName: '奉节县',
        },
        {
          cityId: '500237',
          cityName: '巫山县',
        },
        {
          cityId: '500238',
          cityName: '巫溪县',
        },
        {
          cityId: '500240',
          cityName: '石柱土家族自治县',
        },
        {
          cityId: '500241',
          cityName: '秀山土家族苗族自治县',
        },
        {
          cityId: '500242',
          cityName: '酉阳土家族苗族自治县',
        },
        {
          cityId: '500243',
          cityName: '彭水苗族土家族自治县',
        },
      ],
    },
  ],
  四川省: [
    {
      cityId: '510000',
      cityName: '四川省',
    },
    {
      成都市: [
        {
          cityId: '510100',
          cityName: '成都市',
        },
        {
          cityId: '510101',
          cityName: '市辖区',
        },
        {
          cityId: '510104',
          cityName: '锦江区',
        },
        {
          cityId: '510105',
          cityName: '青羊区',
        },
        {
          cityId: '510106',
          cityName: '金牛区',
        },
        {
          cityId: '510107',
          cityName: '武侯区',
        },
        {
          cityId: '510108',
          cityName: '成华区',
        },
        {
          cityId: '510112',
          cityName: '龙泉驿区',
        },
        {
          cityId: '510113',
          cityName: '青白江区',
        },
        {
          cityId: '510114',
          cityName: '新都区',
        },
        {
          cityId: '510115',
          cityName: '温江区',
        },
        {
          cityId: '510121',
          cityName: '金堂县',
        },
        {
          cityId: '510122',
          cityName: '双流县',
        },
        {
          cityId: '510124',
          cityName: '郫　县',
        },
        {
          cityId: '510129',
          cityName: '大邑县',
        },
        {
          cityId: '510131',
          cityName: '蒲江县',
        },
        {
          cityId: '510132',
          cityName: '新津县',
        },
        {
          cityId: '510181',
          cityName: '都江堰市',
        },
        {
          cityId: '510182',
          cityName: '彭州市',
        },
        {
          cityId: '510183',
          cityName: '邛崃市',
        },
        {
          cityId: '510184',
          cityName: '崇州市',
        },
      ],
    },
    {
      自贡市: [
        {
          cityId: '510300',
          cityName: '自贡市',
        },
        {
          cityId: '510301',
          cityName: '市辖区',
        },
        {
          cityId: '510302',
          cityName: '自流井区',
        },
        {
          cityId: '510303',
          cityName: '贡井区',
        },
        {
          cityId: '510304',
          cityName: '大安区',
        },
        {
          cityId: '510311',
          cityName: '沿滩区',
        },
        {
          cityId: '510321',
          cityName: '荣　县',
        },
        {
          cityId: '510322',
          cityName: '富顺县',
        },
      ],
    },
    {
      攀枝花市: [
        {
          cityId: '510400',
          cityName: '攀枝花市',
        },
        {
          cityId: '510401',
          cityName: '市辖区',
        },
        {
          cityId: '510402',
          cityName: '东　区',
        },
        {
          cityId: '510403',
          cityName: '西　区',
        },
        {
          cityId: '510411',
          cityName: '仁和区',
        },
        {
          cityId: '510421',
          cityName: '米易县',
        },
        {
          cityId: '510422',
          cityName: '盐边县',
        },
      ],
    },
    {
      泸州市: [
        {
          cityId: '510500',
          cityName: '泸州市',
        },
        {
          cityId: '510501',
          cityName: '市辖区',
        },
        {
          cityId: '510502',
          cityName: '江阳区',
        },
        {
          cityId: '510503',
          cityName: '纳溪区',
        },
        {
          cityId: '510504',
          cityName: '龙马潭区',
        },
        {
          cityId: '510521',
          cityName: '泸　县',
        },
        {
          cityId: '510522',
          cityName: '合江县',
        },
        {
          cityId: '510524',
          cityName: '叙永县',
        },
        {
          cityId: '510525',
          cityName: '古蔺县',
        },
      ],
    },
    {
      德阳市: [
        {
          cityId: '510600',
          cityName: '德阳市',
        },
        {
          cityId: '510601',
          cityName: '市辖区',
        },
        {
          cityId: '510603',
          cityName: '旌阳区',
        },
        {
          cityId: '510623',
          cityName: '中江县',
        },
        {
          cityId: '510626',
          cityName: '罗江县',
        },
        {
          cityId: '510681',
          cityName: '广汉市',
        },
        {
          cityId: '510682',
          cityName: '什邡市',
        },
        {
          cityId: '510683',
          cityName: '绵竹市',
        },
      ],
    },
    {
      绵阳市: [
        {
          cityId: '510700',
          cityName: '绵阳市',
        },
        {
          cityId: '510701',
          cityName: '市辖区',
        },
        {
          cityId: '510703',
          cityName: '涪城区',
        },
        {
          cityId: '510704',
          cityName: '游仙区',
        },
        {
          cityId: '510722',
          cityName: '三台县',
        },
        {
          cityId: '510723',
          cityName: '盐亭县',
        },
        {
          cityId: '510724',
          cityName: '安　县',
        },
        {
          cityId: '510725',
          cityName: '梓潼县',
        },
        {
          cityId: '510726',
          cityName: '北川羌族自治县',
        },
        {
          cityId: '510727',
          cityName: '平武县',
        },
        {
          cityId: '510781',
          cityName: '江油市',
        },
      ],
    },
    {
      广元市: [
        {
          cityId: '510800',
          cityName: '广元市',
        },
        {
          cityId: '510801',
          cityName: '市辖区',
        },
        {
          cityId: '510802',
          cityName: '利州区',
        },
        {
          cityId: '510811',
          cityName: '元坝区',
        },
        {
          cityId: '510812',
          cityName: '朝天区',
        },
        {
          cityId: '510821',
          cityName: '旺苍县',
        },
        {
          cityId: '510822',
          cityName: '青川县',
        },
        {
          cityId: '510823',
          cityName: '剑阁县',
        },
        {
          cityId: '510824',
          cityName: '苍溪县',
        },
      ],
    },
    {
      遂宁市: [
        {
          cityId: '510900',
          cityName: '遂宁市',
        },
        {
          cityId: '510901',
          cityName: '市辖区',
        },
        {
          cityId: '510903',
          cityName: '船山区',
        },
        {
          cityId: '510904',
          cityName: '安居区',
        },
        {
          cityId: '510921',
          cityName: '蓬溪县',
        },
        {
          cityId: '510922',
          cityName: '射洪县',
        },
        {
          cityId: '510923',
          cityName: '大英县',
        },
      ],
    },
    {
      内江市: [
        {
          cityId: '511000',
          cityName: '内江市',
        },
        {
          cityId: '511001',
          cityName: '市辖区',
        },
        {
          cityId: '511002',
          cityName: '市中区',
        },
        {
          cityId: '511011',
          cityName: '东兴区',
        },
        {
          cityId: '511024',
          cityName: '威远县',
        },
        {
          cityId: '511025',
          cityName: '资中县',
        },
        {
          cityId: '511028',
          cityName: '隆昌县',
        },
      ],
    },
    {
      乐山市: [
        {
          cityId: '511100',
          cityName: '乐山市',
        },
        {
          cityId: '511101',
          cityName: '市辖区',
        },
        {
          cityId: '511102',
          cityName: '市中区',
        },
        {
          cityId: '511111',
          cityName: '沙湾区',
        },
        {
          cityId: '511112',
          cityName: '五通桥区',
        },
        {
          cityId: '511113',
          cityName: '金口河区',
        },
        {
          cityId: '511123',
          cityName: '犍为县',
        },
        {
          cityId: '511124',
          cityName: '井研县',
        },
        {
          cityId: '511126',
          cityName: '夹江县',
        },
        {
          cityId: '511129',
          cityName: '沐川县',
        },
        {
          cityId: '511132',
          cityName: '峨边彝族自治县',
        },
        {
          cityId: '511133',
          cityName: '马边彝族自治县',
        },
        {
          cityId: '511181',
          cityName: '峨眉山市',
        },
      ],
    },
    {
      南充市: [
        {
          cityId: '511300',
          cityName: '南充市',
        },
        {
          cityId: '511301',
          cityName: '市辖区',
        },
        {
          cityId: '511302',
          cityName: '顺庆区',
        },
        {
          cityId: '511303',
          cityName: '高坪区',
        },
        {
          cityId: '511304',
          cityName: '嘉陵区',
        },
        {
          cityId: '511321',
          cityName: '南部县',
        },
        {
          cityId: '511322',
          cityName: '营山县',
        },
        {
          cityId: '511323',
          cityName: '蓬安县',
        },
        {
          cityId: '511324',
          cityName: '仪陇县',
        },
        {
          cityId: '511325',
          cityName: '西充县',
        },
        {
          cityId: '511381',
          cityName: '阆中市',
        },
      ],
    },
    {
      眉山市: [
        {
          cityId: '511400',
          cityName: '眉山市',
        },
        {
          cityId: '511401',
          cityName: '市辖区',
        },
        {
          cityId: '511402',
          cityName: '东坡区',
        },
        {
          cityId: '511421',
          cityName: '仁寿县',
        },
        {
          cityId: '511422',
          cityName: '彭山县',
        },
        {
          cityId: '511423',
          cityName: '洪雅县',
        },
        {
          cityId: '511424',
          cityName: '丹棱县',
        },
        {
          cityId: '511425',
          cityName: '青神县',
        },
      ],
    },
    {
      宜宾市: [
        {
          cityId: '511500',
          cityName: '宜宾市',
        },
        {
          cityId: '511501',
          cityName: '市辖区',
        },
        {
          cityId: '511502',
          cityName: '翠屏区',
        },
        {
          cityId: '511521',
          cityName: '宜宾县',
        },
        {
          cityId: '511522',
          cityName: '南溪县',
        },
        {
          cityId: '511523',
          cityName: '江安县',
        },
        {
          cityId: '511524',
          cityName: '长宁县',
        },
        {
          cityId: '511525',
          cityName: '高　县',
        },
        {
          cityId: '511526',
          cityName: '珙　县',
        },
        {
          cityId: '511527',
          cityName: '筠连县',
        },
        {
          cityId: '511528',
          cityName: '兴文县',
        },
        {
          cityId: '511529',
          cityName: '屏山县',
        },
      ],
    },
    {
      广安市: [
        {
          cityId: '511600',
          cityName: '广安市',
        },
        {
          cityId: '511601',
          cityName: '市辖区',
        },
        {
          cityId: '511602',
          cityName: '广安区',
        },
        {
          cityId: '511621',
          cityName: '岳池县',
        },
        {
          cityId: '511622',
          cityName: '武胜县',
        },
        {
          cityId: '511623',
          cityName: '邻水县',
        },
        {
          cityId: '511681',
          cityName: '华蓥市',
        },
      ],
    },
    {
      达州市: [
        {
          cityId: '511700',
          cityName: '达州市',
        },
        {
          cityId: '511701',
          cityName: '市辖区',
        },
        {
          cityId: '511702',
          cityName: '通川区',
        },
        {
          cityId: '511721',
          cityName: '达　县',
        },
        {
          cityId: '511722',
          cityName: '宣汉县',
        },
        {
          cityId: '511723',
          cityName: '开江县',
        },
        {
          cityId: '511724',
          cityName: '大竹县',
        },
        {
          cityId: '511725',
          cityName: '渠　县',
        },
        {
          cityId: '511781',
          cityName: '万源市',
        },
      ],
    },
    {
      雅安市: [
        {
          cityId: '511800',
          cityName: '雅安市',
        },
        {
          cityId: '511801',
          cityName: '市辖区',
        },
        {
          cityId: '511802',
          cityName: '雨城区',
        },
        {
          cityId: '511821',
          cityName: '名山县',
        },
        {
          cityId: '511822',
          cityName: '荥经县',
        },
        {
          cityId: '511823',
          cityName: '汉源县',
        },
        {
          cityId: '511824',
          cityName: '石棉县',
        },
        {
          cityId: '511825',
          cityName: '天全县',
        },
        {
          cityId: '511826',
          cityName: '芦山县',
        },
        {
          cityId: '511827',
          cityName: '宝兴县',
        },
      ],
    },
    {
      巴中市: [
        {
          cityId: '511900',
          cityName: '巴中市',
        },
        {
          cityId: '511901',
          cityName: '市辖区',
        },
        {
          cityId: '511902',
          cityName: '巴州区',
        },
        {
          cityId: '511921',
          cityName: '通江县',
        },
        {
          cityId: '511922',
          cityName: '南江县',
        },
        {
          cityId: '511923',
          cityName: '平昌县',
        },
      ],
    },
    {
      资阳市: [
        {
          cityId: '512000',
          cityName: '资阳市',
        },
        {
          cityId: '512001',
          cityName: '市辖区',
        },
        {
          cityId: '512002',
          cityName: '雁江区',
        },
        {
          cityId: '512021',
          cityName: '安岳县',
        },
        {
          cityId: '512022',
          cityName: '乐至县',
        },
        {
          cityId: '512081',
          cityName: '简阳市',
        },
      ],
    },
    {
      阿坝藏族羌族自治州: [
        {
          cityId: '513200',
          cityName: '阿坝藏族羌族自治州',
        },
        {
          cityId: '513221',
          cityName: '汶川县',
        },
        {
          cityId: '513222',
          cityName: '理　县',
        },
        {
          cityId: '513223',
          cityName: '茂　县',
        },
        {
          cityId: '513224',
          cityName: '松潘县',
        },
        {
          cityId: '513225',
          cityName: '九寨沟县',
        },
        {
          cityId: '513226',
          cityName: '金川县',
        },
        {
          cityId: '513227',
          cityName: '小金县',
        },
        {
          cityId: '513228',
          cityName: '黑水县',
        },
        {
          cityId: '513229',
          cityName: '马尔康县',
        },
        {
          cityId: '513230',
          cityName: '壤塘县',
        },
        {
          cityId: '513231',
          cityName: '阿坝县',
        },
        {
          cityId: '513232',
          cityName: '若尔盖县',
        },
        {
          cityId: '513233',
          cityName: '红原县',
        },
      ],
    },
    {
      甘孜藏族自治州: [
        {
          cityId: '513300',
          cityName: '甘孜藏族自治州',
        },
        {
          cityId: '513321',
          cityName: '康定县',
        },
        {
          cityId: '513322',
          cityName: '泸定县',
        },
        {
          cityId: '513323',
          cityName: '丹巴县',
        },
        {
          cityId: '513324',
          cityName: '九龙县',
        },
        {
          cityId: '513325',
          cityName: '雅江县',
        },
        {
          cityId: '513326',
          cityName: '道孚县',
        },
        {
          cityId: '513327',
          cityName: '炉霍县',
        },
        {
          cityId: '513328',
          cityName: '甘孜县',
        },
        {
          cityId: '513329',
          cityName: '新龙县',
        },
        {
          cityId: '513330',
          cityName: '德格县',
        },
        {
          cityId: '513331',
          cityName: '白玉县',
        },
        {
          cityId: '513332',
          cityName: '石渠县',
        },
        {
          cityId: '513333',
          cityName: '色达县',
        },
        {
          cityId: '513334',
          cityName: '理塘县',
        },
        {
          cityId: '513335',
          cityName: '巴塘县',
        },
        {
          cityId: '513336',
          cityName: '乡城县',
        },
        {
          cityId: '513337',
          cityName: '稻城县',
        },
        {
          cityId: '513338',
          cityName: '得荣县',
        },
      ],
    },
    {
      凉山彝族自治州: [
        {
          cityId: '513400',
          cityName: '凉山彝族自治州',
        },
        {
          cityId: '513401',
          cityName: '西昌市',
        },
        {
          cityId: '513422',
          cityName: '木里藏族自治县',
        },
        {
          cityId: '513423',
          cityName: '盐源县',
        },
        {
          cityId: '513424',
          cityName: '德昌县',
        },
        {
          cityId: '513425',
          cityName: '会理县',
        },
        {
          cityId: '513426',
          cityName: '会东县',
        },
        {
          cityId: '513427',
          cityName: '宁南县',
        },
        {
          cityId: '513428',
          cityName: '普格县',
        },
        {
          cityId: '513429',
          cityName: '布拖县',
        },
        {
          cityId: '513430',
          cityName: '金阳县',
        },
        {
          cityId: '513431',
          cityName: '昭觉县',
        },
        {
          cityId: '513432',
          cityName: '喜德县',
        },
        {
          cityId: '513433',
          cityName: '冕宁县',
        },
        {
          cityId: '513434',
          cityName: '越西县',
        },
        {
          cityId: '513435',
          cityName: '甘洛县',
        },
        {
          cityId: '513436',
          cityName: '美姑县',
        },
        {
          cityId: '513437',
          cityName: '雷波县',
        },
      ],
    },
  ],
  贵州省: [
    {
      cityId: '520000',
      cityName: '贵州省',
    },
    {
      贵阳市: [
        {
          cityId: '520100',
          cityName: '贵阳市',
        },
        {
          cityId: '520101',
          cityName: '市辖区',
        },
        {
          cityId: '520102',
          cityName: '南明区',
        },
        {
          cityId: '520103',
          cityName: '云岩区',
        },
        {
          cityId: '520111',
          cityName: '花溪区',
        },
        {
          cityId: '520112',
          cityName: '乌当区',
        },
        {
          cityId: '520113',
          cityName: '白云区',
        },
        {
          cityId: '520114',
          cityName: '小河区',
        },
        {
          cityId: '520121',
          cityName: '开阳县',
        },
        {
          cityId: '520122',
          cityName: '息烽县',
        },
        {
          cityId: '520123',
          cityName: '修文县',
        },
        {
          cityId: '520181',
          cityName: '清镇市',
        },
      ],
    },
    {
      六盘水市: [
        {
          cityId: '520200',
          cityName: '六盘水市',
        },
        {
          cityId: '520201',
          cityName: '钟山区',
        },
        {
          cityId: '520203',
          cityName: '六枝特区',
        },
        {
          cityId: '520221',
          cityName: '水城县',
        },
        {
          cityId: '520222',
          cityName: '盘　县',
        },
      ],
    },
    {
      遵义市: [
        {
          cityId: '520300',
          cityName: '遵义市',
        },
        {
          cityId: '520301',
          cityName: '市辖区',
        },
        {
          cityId: '520302',
          cityName: '红花岗区',
        },
        {
          cityId: '520303',
          cityName: '汇川区',
        },
        {
          cityId: '520321',
          cityName: '遵义县',
        },
        {
          cityId: '520322',
          cityName: '桐梓县',
        },
        {
          cityId: '520323',
          cityName: '绥阳县',
        },
        {
          cityId: '520324',
          cityName: '正安县',
        },
        {
          cityId: '520325',
          cityName: '道真仡佬族苗族自治县',
        },
        {
          cityId: '520326',
          cityName: '务川仡佬族苗族自治县',
        },
        {
          cityId: '520327',
          cityName: '凤冈县',
        },
        {
          cityId: '520328',
          cityName: '湄潭县',
        },
        {
          cityId: '520329',
          cityName: '余庆县',
        },
        {
          cityId: '520330',
          cityName: '习水县',
        },
        {
          cityId: '520381',
          cityName: '赤水市',
        },
        {
          cityId: '520382',
          cityName: '仁怀市',
        },
      ],
    },
    {
      安顺市: [
        {
          cityId: '520400',
          cityName: '安顺市',
        },
        {
          cityId: '520401',
          cityName: '市辖区',
        },
        {
          cityId: '520402',
          cityName: '西秀区',
        },
        {
          cityId: '520421',
          cityName: '平坝县',
        },
        {
          cityId: '520422',
          cityName: '普定县',
        },
        {
          cityId: '520423',
          cityName: '镇宁布依族苗族自治县',
        },
        {
          cityId: '520424',
          cityName: '关岭布依族苗族自治县',
        },
        {
          cityId: '520425',
          cityName: '紫云苗族布依族自治县',
        },
      ],
    },
    {
      铜仁地区: [
        {
          cityId: '522200',
          cityName: '铜仁地区',
        },
        {
          cityId: '522201',
          cityName: '铜仁市',
        },
        {
          cityId: '522222',
          cityName: '江口县',
        },
        {
          cityId: '522223',
          cityName: '玉屏侗族自治县',
        },
        {
          cityId: '522224',
          cityName: '石阡县',
        },
        {
          cityId: '522225',
          cityName: '思南县',
        },
        {
          cityId: '522226',
          cityName: '印江土家族苗族自治县',
        },
        {
          cityId: '522227',
          cityName: '德江县',
        },
        {
          cityId: '522228',
          cityName: '沿河土家族自治县',
        },
        {
          cityId: '522229',
          cityName: '松桃苗族自治县',
        },
        {
          cityId: '522230',
          cityName: '万山特区',
        },
      ],
    },
    {
      黔西南布依族苗族自治州: [
        {
          cityId: '522300',
          cityName: '黔西南布依族苗族自治州',
        },
        {
          cityId: '522301',
          cityName: '兴义市',
        },
        {
          cityId: '522322',
          cityName: '兴仁县',
        },
        {
          cityId: '522323',
          cityName: '普安县',
        },
        {
          cityId: '522324',
          cityName: '晴隆县',
        },
        {
          cityId: '522325',
          cityName: '贞丰县',
        },
        {
          cityId: '522326',
          cityName: '望谟县',
        },
        {
          cityId: '522327',
          cityName: '册亨县',
        },
        {
          cityId: '522328',
          cityName: '安龙县',
        },
      ],
    },
    {
      毕节地区: [
        {
          cityId: '522400',
          cityName: '毕节地区',
        },
        {
          cityId: '522401',
          cityName: '毕节市',
        },
        {
          cityId: '522422',
          cityName: '大方县',
        },
        {
          cityId: '522423',
          cityName: '黔西县',
        },
        {
          cityId: '522424',
          cityName: '金沙县',
        },
        {
          cityId: '522425',
          cityName: '织金县',
        },
        {
          cityId: '522426',
          cityName: '纳雍县',
        },
        {
          cityId: '522427',
          cityName: '威宁彝族回族苗族自治县',
        },
        {
          cityId: '522428',
          cityName: '赫章县',
        },
      ],
    },
    {
      黔东南苗族侗族自治州: [
        {
          cityId: '522600',
          cityName: '黔东南苗族侗族自治州',
        },
        {
          cityId: '522601',
          cityName: '凯里市',
        },
        {
          cityId: '522622',
          cityName: '黄平县',
        },
        {
          cityId: '522623',
          cityName: '施秉县',
        },
        {
          cityId: '522624',
          cityName: '三穗县',
        },
        {
          cityId: '522625',
          cityName: '镇远县',
        },
        {
          cityId: '522626',
          cityName: '岑巩县',
        },
        {
          cityId: '522627',
          cityName: '天柱县',
        },
        {
          cityId: '522628',
          cityName: '锦屏县',
        },
        {
          cityId: '522629',
          cityName: '剑河县',
        },
        {
          cityId: '522630',
          cityName: '台江县',
        },
        {
          cityId: '522631',
          cityName: '黎平县',
        },
        {
          cityId: '522632',
          cityName: '榕江县',
        },
        {
          cityId: '522633',
          cityName: '从江县',
        },
        {
          cityId: '522634',
          cityName: '雷山县',
        },
        {
          cityId: '522635',
          cityName: '麻江县',
        },
        {
          cityId: '522636',
          cityName: '丹寨县',
        },
      ],
    },
    {
      黔南布依族苗族自治州: [
        {
          cityId: '522700',
          cityName: '黔南布依族苗族自治州',
        },
        {
          cityId: '522701',
          cityName: '都匀市',
        },
        {
          cityId: '522702',
          cityName: '福泉市',
        },
        {
          cityId: '522722',
          cityName: '荔波县',
        },
        {
          cityId: '522723',
          cityName: '贵定县',
        },
        {
          cityId: '522725',
          cityName: '瓮安县',
        },
        {
          cityId: '522726',
          cityName: '独山县',
        },
        {
          cityId: '522727',
          cityName: '平塘县',
        },
        {
          cityId: '522728',
          cityName: '罗甸县',
        },
        {
          cityId: '522729',
          cityName: '长顺县',
        },
        {
          cityId: '522730',
          cityName: '龙里县',
        },
        {
          cityId: '522731',
          cityName: '惠水县',
        },
        {
          cityId: '522732',
          cityName: '三都水族自治县',
        },
      ],
    },
  ],
  云南省: [
    {
      cityId: '530000',
      cityName: '云南省',
    },
    {
      昆明市: [
        {
          cityId: '530100',
          cityName: '昆明市',
        },
        {
          cityId: '530101',
          cityName: '市辖区',
        },
        {
          cityId: '530102',
          cityName: '五华区',
        },
        {
          cityId: '530103',
          cityName: '盘龙区',
        },
        {
          cityId: '530111',
          cityName: '官渡区',
        },
        {
          cityId: '530112',
          cityName: '西山区',
        },
        {
          cityId: '530113',
          cityName: '东川区',
        },
        {
          cityId: '530121',
          cityName: '呈贡县',
        },
        {
          cityId: '530122',
          cityName: '晋宁县',
        },
        {
          cityId: '530124',
          cityName: '富民县',
        },
        {
          cityId: '530125',
          cityName: '宜良县',
        },
        {
          cityId: '530126',
          cityName: '石林彝族自治县',
        },
        {
          cityId: '530127',
          cityName: '嵩明县',
        },
        {
          cityId: '530128',
          cityName: '禄劝彝族苗族自治县',
        },
        {
          cityId: '530129',
          cityName: '寻甸回族彝族自治县',
        },
        {
          cityId: '530181',
          cityName: '安宁市',
        },
      ],
    },
    {
      曲靖市: [
        {
          cityId: '530300',
          cityName: '曲靖市',
        },
        {
          cityId: '530301',
          cityName: '市辖区',
        },
        {
          cityId: '530302',
          cityName: '麒麟区',
        },
        {
          cityId: '530321',
          cityName: '马龙县',
        },
        {
          cityId: '530322',
          cityName: '陆良县',
        },
        {
          cityId: '530323',
          cityName: '师宗县',
        },
        {
          cityId: '530324',
          cityName: '罗平县',
        },
        {
          cityId: '530325',
          cityName: '富源县',
        },
        {
          cityId: '530326',
          cityName: '会泽县',
        },
        {
          cityId: '530328',
          cityName: '沾益县',
        },
        {
          cityId: '530381',
          cityName: '宣威市',
        },
      ],
    },
    {
      玉溪市: [
        {
          cityId: '530400',
          cityName: '玉溪市',
        },
        {
          cityId: '530401',
          cityName: '市辖区',
        },
        {
          cityId: '530402',
          cityName: '红塔区',
        },
        {
          cityId: '530421',
          cityName: '江川县',
        },
        {
          cityId: '530422',
          cityName: '澄江县',
        },
        {
          cityId: '530423',
          cityName: '通海县',
        },
        {
          cityId: '530424',
          cityName: '华宁县',
        },
        {
          cityId: '530425',
          cityName: '易门县',
        },
        {
          cityId: '530426',
          cityName: '峨山彝族自治县',
        },
        {
          cityId: '530427',
          cityName: '新平彝族傣族自治县',
        },
        {
          cityId: '530428',
          cityName: '元江哈尼族彝族傣族自治县',
        },
      ],
    },
    {
      保山市: [
        {
          cityId: '530500',
          cityName: '保山市',
        },
        {
          cityId: '530501',
          cityName: '市辖区',
        },
        {
          cityId: '530502',
          cityName: '隆阳区',
        },
        {
          cityId: '530521',
          cityName: '施甸县',
        },
        {
          cityId: '530522',
          cityName: '腾冲县',
        },
        {
          cityId: '530523',
          cityName: '龙陵县',
        },
        {
          cityId: '530524',
          cityName: '昌宁县',
        },
      ],
    },
    {
      昭通市: [
        {
          cityId: '530600',
          cityName: '昭通市',
        },
        {
          cityId: '530601',
          cityName: '市辖区',
        },
        {
          cityId: '530602',
          cityName: '昭阳区',
        },
        {
          cityId: '530621',
          cityName: '鲁甸县',
        },
        {
          cityId: '530622',
          cityName: '巧家县',
        },
        {
          cityId: '530623',
          cityName: '盐津县',
        },
        {
          cityId: '530624',
          cityName: '大关县',
        },
        {
          cityId: '530625',
          cityName: '永善县',
        },
        {
          cityId: '530626',
          cityName: '绥江县',
        },
        {
          cityId: '530627',
          cityName: '镇雄县',
        },
        {
          cityId: '530628',
          cityName: '彝良县',
        },
        {
          cityId: '530629',
          cityName: '威信县',
        },
        {
          cityId: '530630',
          cityName: '水富县',
        },
      ],
    },
    {
      丽江市: [
        {
          cityId: '530700',
          cityName: '丽江市',
        },
        {
          cityId: '530701',
          cityName: '市辖区',
        },
        {
          cityId: '530702',
          cityName: '古城区',
        },
        {
          cityId: '530721',
          cityName: '玉龙纳西族自治县',
        },
        {
          cityId: '530722',
          cityName: '永胜县',
        },
        {
          cityId: '530723',
          cityName: '华坪县',
        },
        {
          cityId: '530724',
          cityName: '宁蒗彝族自治县',
        },
      ],
    },
    {
      普洱市: [
        {
          cityId: '530800',
          cityName: '普洱市',
        },
        {
          cityId: '530801',
          cityName: '市辖区',
        },
        {
          cityId: '530802',
          cityName: '思茅区',
        },
        {
          cityId: '530821',
          cityName: '宁洱哈尼族彝族自治县',
        },
        {
          cityId: '530822',
          cityName: '墨江哈尼族自治县',
        },
        {
          cityId: '530823',
          cityName: '景东彝族自治县',
        },
        {
          cityId: '530824',
          cityName: '景谷傣族彝族自治县',
        },
        {
          cityId: '530825',
          cityName: '镇沅彝族哈尼族拉祜族自治县',
        },
        {
          cityId: '530826',
          cityName: '江城哈尼族彝族自治县',
        },
        {
          cityId: '530827',
          cityName: '孟连傣族拉祜族佤族自治县',
        },
        {
          cityId: '530828',
          cityName: '澜沧拉祜族自治县',
        },
        {
          cityId: '530829',
          cityName: '西盟佤族自治县',
        },
      ],
    },
    {
      临沧市: [
        {
          cityId: '530900',
          cityName: '临沧市',
        },
        {
          cityId: '530901',
          cityName: '市辖区',
        },
        {
          cityId: '530902',
          cityName: '临翔区',
        },
        {
          cityId: '530921',
          cityName: '凤庆县',
        },
        {
          cityId: '530922',
          cityName: '云　县',
        },
        {
          cityId: '530923',
          cityName: '永德县',
        },
        {
          cityId: '530924',
          cityName: '镇康县',
        },
        {
          cityId: '530925',
          cityName: '双江拉祜族佤族布朗族傣族自治县',
        },
        {
          cityId: '530926',
          cityName: '耿马傣族佤族自治县',
        },
        {
          cityId: '530927',
          cityName: '沧源佤族自治县',
        },
      ],
    },
    {
      楚雄彝族自治州: [
        {
          cityId: '532300',
          cityName: '楚雄彝族自治州',
        },
        {
          cityId: '532301',
          cityName: '楚雄市',
        },
        {
          cityId: '532322',
          cityName: '双柏县',
        },
        {
          cityId: '532323',
          cityName: '牟定县',
        },
        {
          cityId: '532324',
          cityName: '南华县',
        },
        {
          cityId: '532325',
          cityName: '姚安县',
        },
        {
          cityId: '532326',
          cityName: '大姚县',
        },
        {
          cityId: '532327',
          cityName: '永仁县',
        },
        {
          cityId: '532328',
          cityName: '元谋县',
        },
        {
          cityId: '532329',
          cityName: '武定县',
        },
        {
          cityId: '532331',
          cityName: '禄丰县',
        },
      ],
    },
    {
      红河哈尼族彝族自治州: [
        {
          cityId: '532500',
          cityName: '红河哈尼族彝族自治州',
        },
        {
          cityId: '532501',
          cityName: '个旧市',
        },
        {
          cityId: '532502',
          cityName: '开远市',
        },
        {
          cityId: '532522',
          cityName: '蒙自县',
        },
        {
          cityId: '532523',
          cityName: '屏边苗族自治县',
        },
        {
          cityId: '532524',
          cityName: '建水县',
        },
        {
          cityId: '532525',
          cityName: '石屏县',
        },
        {
          cityId: '532526',
          cityName: '弥勒县',
        },
        {
          cityId: '532527',
          cityName: '泸西县',
        },
        {
          cityId: '532528',
          cityName: '元阳县',
        },
        {
          cityId: '532529',
          cityName: '红河县',
        },
        {
          cityId: '532530',
          cityName: '金平苗族瑶族傣族自治县',
        },
        {
          cityId: '532531',
          cityName: '绿春县',
        },
        {
          cityId: '532532',
          cityName: '河口瑶族自治县',
        },
      ],
    },
    {
      文山壮族苗族自治州: [
        {
          cityId: '532600',
          cityName: '文山壮族苗族自治州',
        },
        {
          cityId: '532621',
          cityName: '文山县',
        },
        {
          cityId: '532622',
          cityName: '砚山县',
        },
        {
          cityId: '532623',
          cityName: '西畴县',
        },
        {
          cityId: '532624',
          cityName: '麻栗坡县',
        },
        {
          cityId: '532625',
          cityName: '马关县',
        },
        {
          cityId: '532626',
          cityName: '丘北县',
        },
        {
          cityId: '532627',
          cityName: '广南县',
        },
        {
          cityId: '532628',
          cityName: '富宁县',
        },
      ],
    },
    {
      西双版纳傣族自治州: [
        {
          cityId: '532800',
          cityName: '西双版纳傣族自治州',
        },
        {
          cityId: '532801',
          cityName: '景洪市',
        },
        {
          cityId: '532822',
          cityName: '勐海县',
        },
        {
          cityId: '532823',
          cityName: '勐腊县',
        },
      ],
    },
    {
      大理白族自治州: [
        {
          cityId: '532900',
          cityName: '大理白族自治州',
        },
        {
          cityId: '532901',
          cityName: '大理市',
        },
        {
          cityId: '532922',
          cityName: '漾濞彝族自治县',
        },
        {
          cityId: '532923',
          cityName: '祥云县',
        },
        {
          cityId: '532924',
          cityName: '宾川县',
        },
        {
          cityId: '532925',
          cityName: '弥渡县',
        },
        {
          cityId: '532926',
          cityName: '南涧彝族自治县',
        },
        {
          cityId: '532927',
          cityName: '巍山彝族回族自治县',
        },
        {
          cityId: '532928',
          cityName: '永平县',
        },
        {
          cityId: '532929',
          cityName: '云龙县',
        },
        {
          cityId: '532930',
          cityName: '洱源县',
        },
        {
          cityId: '532931',
          cityName: '剑川县',
        },
        {
          cityId: '532932',
          cityName: '鹤庆县',
        },
      ],
    },
    {
      德宏傣族景颇族自治州: [
        {
          cityId: '533100',
          cityName: '德宏傣族景颇族自治州',
        },
        {
          cityId: '533102',
          cityName: '瑞丽市',
        },
        {
          cityId: '533103',
          cityName: '潞西市',
        },
        {
          cityId: '533122',
          cityName: '梁河县',
        },
        {
          cityId: '533123',
          cityName: '盈江县',
        },
        {
          cityId: '533124',
          cityName: '陇川县',
        },
      ],
    },
    {
      怒江傈僳族自治州: [
        {
          cityId: '533300',
          cityName: '怒江傈僳族自治州',
        },
        {
          cityId: '533321',
          cityName: '泸水县',
        },
        {
          cityId: '533323',
          cityName: '福贡县',
        },
        {
          cityId: '533324',
          cityName: '贡山独龙族怒族自治县',
        },
        {
          cityId: '533325',
          cityName: '兰坪白族普米族自治县',
        },
      ],
    },
    {
      迪庆藏族自治州: [
        {
          cityId: '533400',
          cityName: '迪庆藏族自治州',
        },
        {
          cityId: '533421',
          cityName: '香格里拉县',
        },
        {
          cityId: '533422',
          cityName: '德钦县',
        },
        {
          cityId: '533423',
          cityName: '维西傈僳族自治县',
        },
      ],
    },
  ],
  西藏自治区: [
    {
      cityId: '540000',
      cityName: '西藏自治区',
    },
    {
      拉萨市: [
        {
          cityId: '540100',
          cityName: '拉萨市',
        },
        {
          cityId: '540101',
          cityName: '市辖区',
        },
        {
          cityId: '540102',
          cityName: '城关区',
        },
        {
          cityId: '540121',
          cityName: '林周县',
        },
        {
          cityId: '540122',
          cityName: '当雄县',
        },
        {
          cityId: '540123',
          cityName: '尼木县',
        },
        {
          cityId: '540124',
          cityName: '曲水县',
        },
        {
          cityId: '540125',
          cityName: '堆龙德庆县',
        },
        {
          cityId: '540126',
          cityName: '达孜县',
        },
        {
          cityId: '540127',
          cityName: '墨竹工卡县',
        },
      ],
    },
    {
      昌都地区: [
        {
          cityId: '542100',
          cityName: '昌都地区',
        },
        {
          cityId: '542121',
          cityName: '昌都县',
        },
        {
          cityId: '542122',
          cityName: '江达县',
        },
        {
          cityId: '542123',
          cityName: '贡觉县',
        },
        {
          cityId: '542124',
          cityName: '类乌齐县',
        },
        {
          cityId: '542125',
          cityName: '丁青县',
        },
        {
          cityId: '542126',
          cityName: '察雅县',
        },
        {
          cityId: '542127',
          cityName: '八宿县',
        },
        {
          cityId: '542128',
          cityName: '左贡县',
        },
        {
          cityId: '542129',
          cityName: '芒康县',
        },
        {
          cityId: '542132',
          cityName: '洛隆县',
        },
        {
          cityId: '542133',
          cityName: '边坝县',
        },
      ],
    },
    {
      山南地区: [
        {
          cityId: '542200',
          cityName: '山南地区',
        },
        {
          cityId: '542221',
          cityName: '乃东县',
        },
        {
          cityId: '542222',
          cityName: '扎囊县',
        },
        {
          cityId: '542223',
          cityName: '贡嘎县',
        },
        {
          cityId: '542224',
          cityName: '桑日县',
        },
        {
          cityId: '542225',
          cityName: '琼结县',
        },
        {
          cityId: '542226',
          cityName: '曲松县',
        },
        {
          cityId: '542227',
          cityName: '措美县',
        },
        {
          cityId: '542228',
          cityName: '洛扎县',
        },
        {
          cityId: '542229',
          cityName: '加查县',
        },
        {
          cityId: '542231',
          cityName: '隆子县',
        },
        {
          cityId: '542232',
          cityName: '错那县',
        },
        {
          cityId: '542233',
          cityName: '浪卡子县',
        },
      ],
    },
    {
      日喀则地区: [
        {
          cityId: '542300',
          cityName: '日喀则地区',
        },
        {
          cityId: '542301',
          cityName: '日喀则市',
        },
        {
          cityId: '542322',
          cityName: '南木林县',
        },
        {
          cityId: '542323',
          cityName: '江孜县',
        },
        {
          cityId: '542324',
          cityName: '定日县',
        },
        {
          cityId: '542325',
          cityName: '萨迦县',
        },
        {
          cityId: '542326',
          cityName: '拉孜县',
        },
        {
          cityId: '542327',
          cityName: '昂仁县',
        },
        {
          cityId: '542328',
          cityName: '谢通门县',
        },
        {
          cityId: '542329',
          cityName: '白朗县',
        },
        {
          cityId: '542330',
          cityName: '仁布县',
        },
        {
          cityId: '542331',
          cityName: '康马县',
        },
        {
          cityId: '542332',
          cityName: '定结县',
        },
        {
          cityId: '542333',
          cityName: '仲巴县',
        },
        {
          cityId: '542334',
          cityName: '亚东县',
        },
        {
          cityId: '542335',
          cityName: '吉隆县',
        },
        {
          cityId: '542336',
          cityName: '聂拉木县',
        },
        {
          cityId: '542337',
          cityName: '萨嘎县',
        },
        {
          cityId: '542338',
          cityName: '岗巴县',
        },
      ],
    },
    {
      那曲地区: [
        {
          cityId: '542400',
          cityName: '那曲地区',
        },
        {
          cityId: '542421',
          cityName: '那曲县',
        },
        {
          cityId: '542422',
          cityName: '嘉黎县',
        },
        {
          cityId: '542423',
          cityName: '比如县',
        },
        {
          cityId: '542424',
          cityName: '聂荣县',
        },
        {
          cityId: '542425',
          cityName: '安多县',
        },
        {
          cityId: '542426',
          cityName: '申扎县',
        },
        {
          cityId: '542427',
          cityName: '索　县',
        },
        {
          cityId: '542428',
          cityName: '班戈县',
        },
        {
          cityId: '542429',
          cityName: '巴青县',
        },
        {
          cityId: '542430',
          cityName: '尼玛县',
        },
      ],
    },
    {
      阿里地区: [
        {
          cityId: '542500',
          cityName: '阿里地区',
        },
        {
          cityId: '542521',
          cityName: '普兰县',
        },
        {
          cityId: '542522',
          cityName: '札达县',
        },
        {
          cityId: '542523',
          cityName: '噶尔县',
        },
        {
          cityId: '542524',
          cityName: '日土县',
        },
        {
          cityId: '542525',
          cityName: '革吉县',
        },
        {
          cityId: '542526',
          cityName: '改则县',
        },
        {
          cityId: '542527',
          cityName: '措勤县',
        },
      ],
    },
    {
      林芝地区: [
        {
          cityId: '542600',
          cityName: '林芝地区',
        },
        {
          cityId: '542621',
          cityName: '林芝县',
        },
        {
          cityId: '542622',
          cityName: '工布江达县',
        },
        {
          cityId: '542623',
          cityName: '米林县',
        },
        {
          cityId: '542624',
          cityName: '墨脱县',
        },
        {
          cityId: '542625',
          cityName: '波密县',
        },
        {
          cityId: '542626',
          cityName: '察隅县',
        },
        {
          cityId: '542627',
          cityName: '朗　县',
        },
      ],
    },
  ],
  陕西省: [
    {
      cityId: '610000',
      cityName: '陕西省',
    },
    {
      西安市: [
        {
          cityId: '610100',
          cityName: '西安市',
        },
        {
          cityId: '610101',
          cityName: '市辖区',
        },
        {
          cityId: '610102',
          cityName: '新城区',
        },
        {
          cityId: '610103',
          cityName: '碑林区',
        },
        {
          cityId: '610104',
          cityName: '莲湖区',
        },
        {
          cityId: '610111',
          cityName: '灞桥区',
        },
        {
          cityId: '610112',
          cityName: '未央区',
        },
        {
          cityId: '610113',
          cityName: '雁塔区',
        },
        {
          cityId: '610114',
          cityName: '阎良区',
        },
        {
          cityId: '610115',
          cityName: '临潼区',
        },
        {
          cityId: '610116',
          cityName: '长安区',
        },
        {
          cityId: '610122',
          cityName: '蓝田县',
        },
        {
          cityId: '610124',
          cityName: '周至县',
        },
        {
          cityId: '610125',
          cityName: '户　县',
        },
        {
          cityId: '610126',
          cityName: '高陵县',
        },
      ],
    },
    {
      铜川市: [
        {
          cityId: '610200',
          cityName: '铜川市',
        },
        {
          cityId: '610201',
          cityName: '市辖区',
        },
        {
          cityId: '610202',
          cityName: '王益区',
        },
        {
          cityId: '610203',
          cityName: '印台区',
        },
        {
          cityId: '610204',
          cityName: '耀州区',
        },
        {
          cityId: '610222',
          cityName: '宜君县',
        },
      ],
    },
    {
      宝鸡市: [
        {
          cityId: '610300',
          cityName: '宝鸡市',
        },
        {
          cityId: '610301',
          cityName: '市辖区',
        },
        {
          cityId: '610302',
          cityName: '渭滨区',
        },
        {
          cityId: '610303',
          cityName: '金台区',
        },
        {
          cityId: '610304',
          cityName: '陈仓区',
        },
        {
          cityId: '610322',
          cityName: '凤翔县',
        },
        {
          cityId: '610323',
          cityName: '岐山县',
        },
        {
          cityId: '610324',
          cityName: '扶风县',
        },
        {
          cityId: '610326',
          cityName: '眉　县',
        },
        {
          cityId: '610327',
          cityName: '陇　县',
        },
        {
          cityId: '610328',
          cityName: '千阳县',
        },
        {
          cityId: '610329',
          cityName: '麟游县',
        },
        {
          cityId: '610330',
          cityName: '凤　县',
        },
        {
          cityId: '610331',
          cityName: '太白县',
        },
      ],
    },
    {
      咸阳市: [
        {
          cityId: '610400',
          cityName: '咸阳市',
        },
        {
          cityId: '610401',
          cityName: '市辖区',
        },
        {
          cityId: '610402',
          cityName: '秦都区',
        },
        {
          cityId: '610403',
          cityName: '杨陵区',
        },
        {
          cityId: '610404',
          cityName: '渭城区',
        },
        {
          cityId: '610422',
          cityName: '三原县',
        },
        {
          cityId: '610423',
          cityName: '泾阳县',
        },
        {
          cityId: '610424',
          cityName: '乾　县',
        },
        {
          cityId: '610425',
          cityName: '礼泉县',
        },
        {
          cityId: '610426',
          cityName: '永寿县',
        },
        {
          cityId: '610427',
          cityName: '彬　县',
        },
        {
          cityId: '610428',
          cityName: '长武县',
        },
        {
          cityId: '610429',
          cityName: '旬邑县',
        },
        {
          cityId: '610430',
          cityName: '淳化县',
        },
        {
          cityId: '610431',
          cityName: '武功县',
        },
        {
          cityId: '610481',
          cityName: '兴平市',
        },
      ],
    },
    {
      渭南市: [
        {
          cityId: '610500',
          cityName: '渭南市',
        },
        {
          cityId: '610501',
          cityName: '市辖区',
        },
        {
          cityId: '610502',
          cityName: '临渭区',
        },
        {
          cityId: '610521',
          cityName: '华　县',
        },
        {
          cityId: '610522',
          cityName: '潼关县',
        },
        {
          cityId: '610523',
          cityName: '大荔县',
        },
        {
          cityId: '610524',
          cityName: '合阳县',
        },
        {
          cityId: '610525',
          cityName: '澄城县',
        },
        {
          cityId: '610526',
          cityName: '蒲城县',
        },
        {
          cityId: '610527',
          cityName: '白水县',
        },
        {
          cityId: '610528',
          cityName: '富平县',
        },
        {
          cityId: '610581',
          cityName: '韩城市',
        },
        {
          cityId: '610582',
          cityName: '华阴市',
        },
      ],
    },
    {
      延安市: [
        {
          cityId: '610600',
          cityName: '延安市',
        },
        {
          cityId: '610601',
          cityName: '市辖区',
        },
        {
          cityId: '610602',
          cityName: '宝塔区',
        },
        {
          cityId: '610621',
          cityName: '延长县',
        },
        {
          cityId: '610622',
          cityName: '延川县',
        },
        {
          cityId: '610623',
          cityName: '子长县',
        },
        {
          cityId: '610624',
          cityName: '安塞县',
        },
        {
          cityId: '610625',
          cityName: '志丹县',
        },
        {
          cityId: '610626',
          cityName: '吴起县',
        },
        {
          cityId: '610627',
          cityName: '甘泉县',
        },
        {
          cityId: '610628',
          cityName: '富　县',
        },
        {
          cityId: '610629',
          cityName: '洛川县',
        },
        {
          cityId: '610630',
          cityName: '宜川县',
        },
        {
          cityId: '610631',
          cityName: '黄龙县',
        },
        {
          cityId: '610632',
          cityName: '黄陵县',
        },
      ],
    },
    {
      汉中市: [
        {
          cityId: '610700',
          cityName: '汉中市',
        },
        {
          cityId: '610701',
          cityName: '市辖区',
        },
        {
          cityId: '610702',
          cityName: '汉台区',
        },
        {
          cityId: '610721',
          cityName: '南郑县',
        },
        {
          cityId: '610722',
          cityName: '城固县',
        },
        {
          cityId: '610723',
          cityName: '洋　县',
        },
        {
          cityId: '610724',
          cityName: '西乡县',
        },
        {
          cityId: '610725',
          cityName: '勉　县',
        },
        {
          cityId: '610726',
          cityName: '宁强县',
        },
        {
          cityId: '610727',
          cityName: '略阳县',
        },
        {
          cityId: '610728',
          cityName: '镇巴县',
        },
        {
          cityId: '610729',
          cityName: '留坝县',
        },
        {
          cityId: '610730',
          cityName: '佛坪县',
        },
      ],
    },
    {
      榆林市: [
        {
          cityId: '610800',
          cityName: '榆林市',
        },
        {
          cityId: '610801',
          cityName: '市辖区',
        },
        {
          cityId: '610802',
          cityName: '榆阳区',
        },
        {
          cityId: '610821',
          cityName: '神木县',
        },
        {
          cityId: '610822',
          cityName: '府谷县',
        },
        {
          cityId: '610823',
          cityName: '横山县',
        },
        {
          cityId: '610824',
          cityName: '靖边县',
        },
        {
          cityId: '610825',
          cityName: '定边县',
        },
        {
          cityId: '610826',
          cityName: '绥德县',
        },
        {
          cityId: '610827',
          cityName: '米脂县',
        },
        {
          cityId: '610828',
          cityName: '佳　县',
        },
        {
          cityId: '610829',
          cityName: '吴堡县',
        },
        {
          cityId: '610830',
          cityName: '清涧县',
        },
        {
          cityId: '610831',
          cityName: '子洲县',
        },
      ],
    },
    {
      安康市: [
        {
          cityId: '610900',
          cityName: '安康市',
        },
        {
          cityId: '610901',
          cityName: '市辖区',
        },
        {
          cityId: '610902',
          cityName: '汉滨区',
        },
        {
          cityId: '610921',
          cityName: '汉阴县',
        },
        {
          cityId: '610922',
          cityName: '石泉县',
        },
        {
          cityId: '610923',
          cityName: '宁陕县',
        },
        {
          cityId: '610924',
          cityName: '紫阳县',
        },
        {
          cityId: '610925',
          cityName: '岚皋县',
        },
        {
          cityId: '610926',
          cityName: '平利县',
        },
        {
          cityId: '610927',
          cityName: '镇坪县',
        },
        {
          cityId: '610928',
          cityName: '旬阳县',
        },
        {
          cityId: '610929',
          cityName: '白河县',
        },
      ],
    },
    {
      商洛市: [
        {
          cityId: '611000',
          cityName: '商洛市',
        },
        {
          cityId: '611001',
          cityName: '市辖区',
        },
        {
          cityId: '611002',
          cityName: '商州区',
        },
        {
          cityId: '611021',
          cityName: '洛南县',
        },
        {
          cityId: '611022',
          cityName: '丹凤县',
        },
        {
          cityId: '611023',
          cityName: '商南县',
        },
        {
          cityId: '611024',
          cityName: '山阳县',
        },
        {
          cityId: '611025',
          cityName: '镇安县',
        },
        {
          cityId: '611026',
          cityName: '柞水县',
        },
      ],
    },
  ],
  甘肃省: [
    {
      cityId: '620000',
      cityName: '甘肃省',
    },
    {
      兰州市: [
        {
          cityId: '620100',
          cityName: '兰州市',
        },
        {
          cityId: '620101',
          cityName: '市辖区',
        },
        {
          cityId: '620102',
          cityName: '城关区',
        },
        {
          cityId: '620103',
          cityName: '七里河区',
        },
        {
          cityId: '620104',
          cityName: '西固区',
        },
        {
          cityId: '620105',
          cityName: '安宁区',
        },
        {
          cityId: '620111',
          cityName: '红古区',
        },
        {
          cityId: '620121',
          cityName: '永登县',
        },
        {
          cityId: '620122',
          cityName: '皋兰县',
        },
        {
          cityId: '620123',
          cityName: '榆中县',
        },
      ],
    },
    {
      嘉峪关市: [
        {
          cityId: '620200',
          cityName: '嘉峪关市',
        },
        {
          cityId: '620201',
          cityName: '市辖区',
        },
      ],
    },
    {
      金昌市: [
        {
          cityId: '620300',
          cityName: '金昌市',
        },
        {
          cityId: '620301',
          cityName: '市辖区',
        },
        {
          cityId: '620302',
          cityName: '金川区',
        },
        {
          cityId: '620321',
          cityName: '永昌县',
        },
      ],
    },
    {
      白银市: [
        {
          cityId: '620400',
          cityName: '白银市',
        },
        {
          cityId: '620401',
          cityName: '市辖区',
        },
        {
          cityId: '620402',
          cityName: '白银区',
        },
        {
          cityId: '620403',
          cityName: '平川区',
        },
        {
          cityId: '620421',
          cityName: '靖远县',
        },
        {
          cityId: '620422',
          cityName: '会宁县',
        },
        {
          cityId: '620423',
          cityName: '景泰县',
        },
      ],
    },
    {
      天水市: [
        {
          cityId: '620500',
          cityName: '天水市',
        },
        {
          cityId: '620501',
          cityName: '市辖区',
        },
        {
          cityId: '620502',
          cityName: '秦州区',
        },
        {
          cityId: '620503',
          cityName: '麦积区',
        },
        {
          cityId: '620521',
          cityName: '清水县',
        },
        {
          cityId: '620522',
          cityName: '秦安县',
        },
        {
          cityId: '620523',
          cityName: '甘谷县',
        },
        {
          cityId: '620524',
          cityName: '武山县',
        },
        {
          cityId: '620525',
          cityName: '张家川回族自治县',
        },
      ],
    },
    {
      武威市: [
        {
          cityId: '620600',
          cityName: '武威市',
        },
        {
          cityId: '620601',
          cityName: '市辖区',
        },
        {
          cityId: '620602',
          cityName: '凉州区',
        },
        {
          cityId: '620621',
          cityName: '民勤县',
        },
        {
          cityId: '620622',
          cityName: '古浪县',
        },
        {
          cityId: '620623',
          cityName: '天祝藏族自治县',
        },
      ],
    },
    {
      张掖市: [
        {
          cityId: '620700',
          cityName: '张掖市',
        },
        {
          cityId: '620701',
          cityName: '市辖区',
        },
        {
          cityId: '620702',
          cityName: '甘州区',
        },
        {
          cityId: '620721',
          cityName: '肃南裕固族自治县',
        },
        {
          cityId: '620722',
          cityName: '民乐县',
        },
        {
          cityId: '620723',
          cityName: '临泽县',
        },
        {
          cityId: '620724',
          cityName: '高台县',
        },
        {
          cityId: '620725',
          cityName: '山丹县',
        },
      ],
    },
    {
      平凉市: [
        {
          cityId: '620800',
          cityName: '平凉市',
        },
        {
          cityId: '620801',
          cityName: '市辖区',
        },
        {
          cityId: '620802',
          cityName: '崆峒区',
        },
        {
          cityId: '620821',
          cityName: '泾川县',
        },
        {
          cityId: '620822',
          cityName: '灵台县',
        },
        {
          cityId: '620823',
          cityName: '崇信县',
        },
        {
          cityId: '620824',
          cityName: '华亭县',
        },
        {
          cityId: '620825',
          cityName: '庄浪县',
        },
        {
          cityId: '620826',
          cityName: '静宁县',
        },
      ],
    },
    {
      酒泉市: [
        {
          cityId: '620900',
          cityName: '酒泉市',
        },
        {
          cityId: '620901',
          cityName: '市辖区',
        },
        {
          cityId: '620902',
          cityName: '肃州区',
        },
        {
          cityId: '620921',
          cityName: '金塔县',
        },
        {
          cityId: '620922',
          cityName: '瓜州县',
        },
        {
          cityId: '620923',
          cityName: '肃北蒙古族自治县',
        },
        {
          cityId: '620924',
          cityName: '阿克塞哈萨克族自治县',
        },
        {
          cityId: '620981',
          cityName: '玉门市',
        },
        {
          cityId: '620982',
          cityName: '敦煌市',
        },
      ],
    },
    {
      庆阳市: [
        {
          cityId: '621000',
          cityName: '庆阳市',
        },
        {
          cityId: '621001',
          cityName: '市辖区',
        },
        {
          cityId: '621002',
          cityName: '西峰区',
        },
        {
          cityId: '621021',
          cityName: '庆城县',
        },
        {
          cityId: '621022',
          cityName: '环　县',
        },
        {
          cityId: '621023',
          cityName: '华池县',
        },
        {
          cityId: '621024',
          cityName: '合水县',
        },
        {
          cityId: '621025',
          cityName: '正宁县',
        },
        {
          cityId: '621026',
          cityName: '宁　县',
        },
        {
          cityId: '621027',
          cityName: '镇原县',
        },
      ],
    },
    {
      定西市: [
        {
          cityId: '621100',
          cityName: '定西市',
        },
        {
          cityId: '621101',
          cityName: '市辖区',
        },
        {
          cityId: '621102',
          cityName: '安定区',
        },
        {
          cityId: '621121',
          cityName: '通渭县',
        },
        {
          cityId: '621122',
          cityName: '陇西县',
        },
        {
          cityId: '621123',
          cityName: '渭源县',
        },
        {
          cityId: '621124',
          cityName: '临洮县',
        },
        {
          cityId: '621125',
          cityName: '漳　县',
        },
        {
          cityId: '621126',
          cityName: '岷　县',
        },
      ],
    },
    {
      陇南市: [
        {
          cityId: '621200',
          cityName: '陇南市',
        },
        {
          cityId: '621201',
          cityName: '市辖区',
        },
        {
          cityId: '621202',
          cityName: '武都区',
        },
        {
          cityId: '621221',
          cityName: '成　县',
        },
        {
          cityId: '621222',
          cityName: '文　县',
        },
        {
          cityId: '621223',
          cityName: '宕昌县',
        },
        {
          cityId: '621224',
          cityName: '康　县',
        },
        {
          cityId: '621225',
          cityName: '西和县',
        },
        {
          cityId: '621226',
          cityName: '礼　县',
        },
        {
          cityId: '621227',
          cityName: '徽　县',
        },
        {
          cityId: '621228',
          cityName: '两当县',
        },
      ],
    },
    {
      临夏回族自治州: [
        {
          cityId: '622900',
          cityName: '临夏回族自治州',
        },
        {
          cityId: '622901',
          cityName: '临夏市',
        },
        {
          cityId: '622921',
          cityName: '临夏县',
        },
        {
          cityId: '622922',
          cityName: '康乐县',
        },
        {
          cityId: '622923',
          cityName: '永靖县',
        },
        {
          cityId: '622924',
          cityName: '广河县',
        },
        {
          cityId: '622925',
          cityName: '和政县',
        },
        {
          cityId: '622926',
          cityName: '东乡族自治县',
        },
        {
          cityId: '622927',
          cityName: '积石山保安族东乡族撒拉族自治县',
        },
      ],
    },
    {
      甘南藏族自治州: [
        {
          cityId: '623000',
          cityName: '甘南藏族自治州',
        },
        {
          cityId: '623001',
          cityName: '合作市',
        },
        {
          cityId: '623021',
          cityName: '临潭县',
        },
        {
          cityId: '623022',
          cityName: '卓尼县',
        },
        {
          cityId: '623023',
          cityName: '舟曲县',
        },
        {
          cityId: '623024',
          cityName: '迭部县',
        },
        {
          cityId: '623025',
          cityName: '玛曲县',
        },
        {
          cityId: '623026',
          cityName: '碌曲县',
        },
        {
          cityId: '623027',
          cityName: '夏河县',
        },
      ],
    },
  ],
  青海省: [
    {
      cityId: '630000',
      cityName: '青海省',
    },
    {
      西宁市: [
        {
          cityId: '630100',
          cityName: '西宁市',
        },
        {
          cityId: '630101',
          cityName: '市辖区',
        },
        {
          cityId: '630102',
          cityName: '城东区',
        },
        {
          cityId: '630103',
          cityName: '城中区',
        },
        {
          cityId: '630104',
          cityName: '城西区',
        },
        {
          cityId: '630105',
          cityName: '城北区',
        },
        {
          cityId: '630121',
          cityName: '大通回族土族自治县',
        },
        {
          cityId: '630122',
          cityName: '湟中县',
        },
        {
          cityId: '630123',
          cityName: '湟源县',
        },
      ],
    },
    {
      海东地区: [
        {
          cityId: '632100',
          cityName: '海东地区',
        },
        {
          cityId: '632121',
          cityName: '平安县',
        },
        {
          cityId: '632122',
          cityName: '民和回族土族自治县',
        },
        {
          cityId: '632123',
          cityName: '乐都县',
        },
        {
          cityId: '632126',
          cityName: '互助土族自治县',
        },
        {
          cityId: '632127',
          cityName: '化隆回族自治县',
        },
        {
          cityId: '632128',
          cityName: '循化撒拉族自治县',
        },
      ],
    },
    {
      海北藏族自治州: [
        {
          cityId: '632200',
          cityName: '海北藏族自治州',
        },
        {
          cityId: '632221',
          cityName: '门源回族自治县',
        },
        {
          cityId: '632222',
          cityName: '祁连县',
        },
        {
          cityId: '632223',
          cityName: '海晏县',
        },
        {
          cityId: '632224',
          cityName: '刚察县',
        },
      ],
    },
    {
      黄南藏族自治州: [
        {
          cityId: '632300',
          cityName: '黄南藏族自治州',
        },
        {
          cityId: '632321',
          cityName: '同仁县',
        },
        {
          cityId: '632322',
          cityName: '尖扎县',
        },
        {
          cityId: '632323',
          cityName: '泽库县',
        },
        {
          cityId: '632324',
          cityName: '河南蒙古族自治县',
        },
      ],
    },
    {
      海南藏族自治州: [
        {
          cityId: '632500',
          cityName: '海南藏族自治州',
        },
        {
          cityId: '632521',
          cityName: '共和县',
        },
        {
          cityId: '632522',
          cityName: '同德县',
        },
        {
          cityId: '632523',
          cityName: '贵德县',
        },
        {
          cityId: '632524',
          cityName: '兴海县',
        },
        {
          cityId: '632525',
          cityName: '贵南县',
        },
      ],
    },
    {
      果洛藏族自治州: [
        {
          cityId: '632600',
          cityName: '果洛藏族自治州',
        },
        {
          cityId: '632621',
          cityName: '玛沁县',
        },
        {
          cityId: '632622',
          cityName: '班玛县',
        },
        {
          cityId: '632623',
          cityName: '甘德县',
        },
        {
          cityId: '632624',
          cityName: '达日县',
        },
        {
          cityId: '632625',
          cityName: '久治县',
        },
        {
          cityId: '632626',
          cityName: '玛多县',
        },
      ],
    },
    {
      玉树藏族自治州: [
        {
          cityId: '632700',
          cityName: '玉树藏族自治州',
        },
        {
          cityId: '632721',
          cityName: '玉树县',
        },
        {
          cityId: '632722',
          cityName: '杂多县',
        },
        {
          cityId: '632723',
          cityName: '称多县',
        },
        {
          cityId: '632724',
          cityName: '治多县',
        },
        {
          cityId: '632725',
          cityName: '囊谦县',
        },
        {
          cityId: '632726',
          cityName: '曲麻莱县',
        },
      ],
    },
    {
      海西蒙古族藏族自治州: [
        {
          cityId: '632800',
          cityName: '海西蒙古族藏族自治州',
        },
        {
          cityId: '632801',
          cityName: '格尔木市',
        },
        {
          cityId: '632802',
          cityName: '德令哈市',
        },
        {
          cityId: '632821',
          cityName: '乌兰县',
        },
        {
          cityId: '632822',
          cityName: '都兰县',
        },
        {
          cityId: '632823',
          cityName: '天峻县',
        },
      ],
    },
  ],
  宁夏回族自治区: [
    {
      cityId: '640000',
      cityName: '宁夏回族自治区',
    },
    {
      银川市: [
        {
          cityId: '640100',
          cityName: '银川市',
        },
        {
          cityId: '640101',
          cityName: '市辖区',
        },
        {
          cityId: '640104',
          cityName: '兴庆区',
        },
        {
          cityId: '640105',
          cityName: '西夏区',
        },
        {
          cityId: '640106',
          cityName: '金凤区',
        },
        {
          cityId: '640121',
          cityName: '永宁县',
        },
        {
          cityId: '640122',
          cityName: '贺兰县',
        },
        {
          cityId: '640181',
          cityName: '灵武市',
        },
      ],
    },
    {
      石嘴山市: [
        {
          cityId: '640200',
          cityName: '石嘴山市',
        },
        {
          cityId: '640201',
          cityName: '市辖区',
        },
        {
          cityId: '640202',
          cityName: '大武口区',
        },
        {
          cityId: '640205',
          cityName: '惠农区',
        },
        {
          cityId: '640221',
          cityName: '平罗县',
        },
      ],
    },
    {
      吴忠市: [
        {
          cityId: '640300',
          cityName: '吴忠市',
        },
        {
          cityId: '640301',
          cityName: '市辖区',
        },
        {
          cityId: '640302',
          cityName: '利通区',
        },
        {
          cityId: '640303',
          cityName: '红寺堡区',
        },
        {
          cityId: '640323',
          cityName: '盐池县',
        },
        {
          cityId: '640324',
          cityName: '同心县',
        },
        {
          cityId: '640381',
          cityName: '青铜峡市',
        },
      ],
    },
    {
      固原市: [
        {
          cityId: '640400',
          cityName: '固原市',
        },
        {
          cityId: '640401',
          cityName: '市辖区',
        },
        {
          cityId: '640402',
          cityName: '原州区',
        },
        {
          cityId: '640422',
          cityName: '西吉县',
        },
        {
          cityId: '640423',
          cityName: '隆德县',
        },
        {
          cityId: '640424',
          cityName: '泾源县',
        },
        {
          cityId: '640425',
          cityName: '彭阳县',
        },
      ],
    },
    {
      中卫市: [
        {
          cityId: '640500',
          cityName: '中卫市',
        },
        {
          cityId: '640501',
          cityName: '市辖区',
        },
        {
          cityId: '640502',
          cityName: '沙坡头区',
        },
        {
          cityId: '640521',
          cityName: '中宁县',
        },
        {
          cityId: '640522',
          cityName: '海原县',
        },
      ],
    },
  ],
  新疆维吾尔自治区: [
    {
      cityId: '650000',
      cityName: '新疆维吾尔自治区',
    },
    {
      乌鲁木齐市: [
        {
          cityId: '650100',
          cityName: '乌鲁木齐市',
        },
        {
          cityId: '650101',
          cityName: '市辖区',
        },
        {
          cityId: '650102',
          cityName: '天山区',
        },
        {
          cityId: '650103',
          cityName: '沙依巴克区',
        },
        {
          cityId: '650104',
          cityName: '新市区',
        },
        {
          cityId: '650105',
          cityName: '水磨沟区',
        },
        {
          cityId: '650106',
          cityName: '头屯河区',
        },
        {
          cityId: '650107',
          cityName: '达坂城区',
        },
        {
          cityId: '650109',
          cityName: '米东区',
        },
        {
          cityId: '650121',
          cityName: '乌鲁木齐县',
        },
      ],
    },
    {
      克拉玛依市: [
        {
          cityId: '650200',
          cityName: '克拉玛依市',
        },
        {
          cityId: '650201',
          cityName: '市辖区',
        },
        {
          cityId: '650202',
          cityName: '独山子区',
        },
        {
          cityId: '650203',
          cityName: '克拉玛依区',
        },
        {
          cityId: '650204',
          cityName: '白碱滩区',
        },
        {
          cityId: '650205',
          cityName: '乌尔禾区',
        },
      ],
    },
    {
      吐鲁番地区: [
        {
          cityId: '652100',
          cityName: '吐鲁番地区',
        },
        {
          cityId: '652101',
          cityName: '吐鲁番市',
        },
        {
          cityId: '652122',
          cityName: '鄯善县',
        },
        {
          cityId: '652123',
          cityName: '托克逊县',
        },
      ],
    },
    {
      哈密地区: [
        {
          cityId: '652200',
          cityName: '哈密地区',
        },
        {
          cityId: '652201',
          cityName: '哈密市',
        },
        {
          cityId: '652222',
          cityName: '巴里坤哈萨克自治县',
        },
        {
          cityId: '652223',
          cityName: '伊吾县',
        },
      ],
    },
    {
      昌吉回族自治州: [
        {
          cityId: '652300',
          cityName: '昌吉回族自治州',
        },
        {
          cityId: '652301',
          cityName: '昌吉市',
        },
        {
          cityId: '652302',
          cityName: '阜康市',
        },
        {
          cityId: '652323',
          cityName: '呼图壁县',
        },
        {
          cityId: '652324',
          cityName: '玛纳斯县',
        },
        {
          cityId: '652325',
          cityName: '奇台县',
        },
        {
          cityId: '652327',
          cityName: '吉木萨尔县',
        },
        {
          cityId: '652328',
          cityName: '木垒哈萨克自治县',
        },
      ],
    },
    {
      博尔塔拉蒙古自治州: [
        {
          cityId: '652700',
          cityName: '博尔塔拉蒙古自治州',
        },
        {
          cityId: '652701',
          cityName: '博乐市',
        },
        {
          cityId: '652722',
          cityName: '精河县',
        },
        {
          cityId: '652723',
          cityName: '温泉县',
        },
      ],
    },
    {
      巴音郭楞蒙古自治州: [
        {
          cityId: '652800',
          cityName: '巴音郭楞蒙古自治州',
        },
        {
          cityId: '652801',
          cityName: '库尔勒市',
        },
        {
          cityId: '652822',
          cityName: '轮台县',
        },
        {
          cityId: '652823',
          cityName: '尉犁县',
        },
        {
          cityId: '652824',
          cityName: '若羌县',
        },
        {
          cityId: '652825',
          cityName: '且末县',
        },
        {
          cityId: '652826',
          cityName: '焉耆回族自治县',
        },
        {
          cityId: '652827',
          cityName: '和静县',
        },
        {
          cityId: '652828',
          cityName: '和硕县',
        },
        {
          cityId: '652829',
          cityName: '博湖县',
        },
      ],
    },
    {
      阿克苏地区: [
        {
          cityId: '652900',
          cityName: '阿克苏地区',
        },
        {
          cityId: '652901',
          cityName: '阿克苏市',
        },
        {
          cityId: '652922',
          cityName: '温宿县',
        },
        {
          cityId: '652923',
          cityName: '库车县',
        },
        {
          cityId: '652924',
          cityName: '沙雅县',
        },
        {
          cityId: '652925',
          cityName: '新和县',
        },
        {
          cityId: '652926',
          cityName: '拜城县',
        },
        {
          cityId: '652927',
          cityName: '乌什县',
        },
        {
          cityId: '652928',
          cityName: '阿瓦提县',
        },
        {
          cityId: '652929',
          cityName: '柯坪县',
        },
      ],
    },
    {
      克孜勒苏柯尔克孜自治州: [
        {
          cityId: '653000',
          cityName: '克孜勒苏柯尔克孜自治州',
        },
        {
          cityId: '653001',
          cityName: '阿图什市',
        },
        {
          cityId: '653022',
          cityName: '阿克陶县',
        },
        {
          cityId: '653023',
          cityName: '阿合奇县',
        },
        {
          cityId: '653024',
          cityName: '乌恰县',
        },
      ],
    },
    {
      喀什地区: [
        {
          cityId: '653100',
          cityName: '喀什地区',
        },
        {
          cityId: '653101',
          cityName: '喀什市',
        },
        {
          cityId: '653121',
          cityName: '疏附县',
        },
        {
          cityId: '653122',
          cityName: '疏勒县',
        },
        {
          cityId: '653123',
          cityName: '英吉沙县',
        },
        {
          cityId: '653124',
          cityName: '泽普县',
        },
        {
          cityId: '653125',
          cityName: '莎车县',
        },
        {
          cityId: '653126',
          cityName: '叶城县',
        },
        {
          cityId: '653127',
          cityName: '麦盖提县',
        },
        {
          cityId: '653128',
          cityName: '岳普湖县',
        },
        {
          cityId: '653129',
          cityName: '伽师县',
        },
        {
          cityId: '653130',
          cityName: '巴楚县',
        },
        {
          cityId: '653131',
          cityName: '塔什库尔干塔吉克自治县',
        },
      ],
    },
    {
      和田地区: [
        {
          cityId: '653200',
          cityName: '和田地区',
        },
        {
          cityId: '653201',
          cityName: '和田市',
        },
        {
          cityId: '653221',
          cityName: '和田县',
        },
        {
          cityId: '653222',
          cityName: '墨玉县',
        },
        {
          cityId: '653223',
          cityName: '皮山县',
        },
        {
          cityId: '653224',
          cityName: '洛浦县',
        },
        {
          cityId: '653225',
          cityName: '策勒县',
        },
        {
          cityId: '653226',
          cityName: '于田县',
        },
        {
          cityId: '653227',
          cityName: '民丰县',
        },
      ],
    },
    {
      伊犁哈萨克自治州: [
        {
          cityId: '654000',
          cityName: '伊犁哈萨克自治州',
        },
        {
          cityId: '654002',
          cityName: '伊宁市',
        },
        {
          cityId: '654003',
          cityName: '奎屯市',
        },
        {
          cityId: '654021',
          cityName: '伊宁县',
        },
        {
          cityId: '654022',
          cityName: '察布查尔锡伯自治县',
        },
        {
          cityId: '654023',
          cityName: '霍城县',
        },
        {
          cityId: '654024',
          cityName: '巩留县',
        },
        {
          cityId: '654025',
          cityName: '新源县',
        },
        {
          cityId: '654026',
          cityName: '昭苏县',
        },
        {
          cityId: '654027',
          cityName: '特克斯县',
        },
        {
          cityId: '654028',
          cityName: '尼勒克县',
        },
      ],
    },
    {
      塔城地区: [
        {
          cityId: '654200',
          cityName: '塔城地区',
        },
        {
          cityId: '654201',
          cityName: '塔城市',
        },
        {
          cityId: '654202',
          cityName: '乌苏市',
        },
        {
          cityId: '654221',
          cityName: '额敏县',
        },
        {
          cityId: '654223',
          cityName: '沙湾县',
        },
        {
          cityId: '654224',
          cityName: '托里县',
        },
        {
          cityId: '654225',
          cityName: '裕民县',
        },
        {
          cityId: '654226',
          cityName: '和布克赛尔蒙古自治县',
        },
      ],
    },
    {
      阿勒泰地区: [
        {
          cityId: '654300',
          cityName: '阿勒泰地区',
        },
        {
          cityId: '654301',
          cityName: '阿勒泰市',
        },
        {
          cityId: '654321',
          cityName: '布尔津县',
        },
        {
          cityId: '654322',
          cityName: '富蕴县',
        },
        {
          cityId: '654323',
          cityName: '福海县',
        },
        {
          cityId: '654324',
          cityName: '哈巴河县',
        },
        {
          cityId: '654325',
          cityName: '青河县',
        },
        {
          cityId: '654326',
          cityName: '吉木乃县',
        },
      ],
    },
    {
      自治区直辖县级行政区划: [
        {
          cityId: '659000',
          cityName: '自治区直辖县级行政区划',
        },
        {
          cityId: '659001',
          cityName: '石河子市',
        },
        {
          cityId: '659002',
          cityName: '阿拉尔市',
        },
        {
          cityId: '659003',
          cityName: '图木舒克市',
        },
        {
          cityId: '659004',
          cityName: '五家渠市',
        },
      ],
    },
  ],
  台湾省: [
    {
      cityId: '710000',
      cityName: '台湾省',
    },
  ],
  香港特别行政区: [
    {
      cityId: '810000',
      cityName: '香港特别行政区',
    },
  ],
  澳门特别行政区: [
    {
      cityId: '820000',
      cityName: '澳门特别行政区',
    },
  ],
};

export { cities, provinces };
