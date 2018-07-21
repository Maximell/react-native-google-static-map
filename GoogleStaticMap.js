import {Image, PixelRatio} from 'react-native';
import React, {Component} from 'react';
import PropTypes from 'prop-types';

const defaultMapScale = ()=> {
  const isRetina = PixelRatio.get() >= 2;
  return isRetina ? 2 : 1;
};

const values = (obj)=> {
  return Object.keys(obj).map(key => obj[key]);
};

const IMAGE_FORMATS = {
  //png8 or png (default) specifies the 8-bit PNG format.
  PNG: 'png',

  //png32 specifies the 32-bit PNG format.
  PNG32: 'png32',

  //gif specifies the GIF format.
  GIF: 'gif',

  //jpg specifies the JPEG compression format.
  JPG: 'jpg',

  //jpg-baseline specifies a non-progressive JPEG compression format.
  JPG_BASELINE: 'jpg-baseline'
};

const MAP_TYPES = {
  //roadmap (default) specifies a standard roadmap image, as is normally shown on the Google Maps website.
  ROADMAP: 'roadmap',

  //satellite specifies a satellite image.
  SATELLITE: 'satellite',

  //terrain specifies a physical relief map image, showing terrain and vegetation.
  TERRAIN: 'terrain',

  //hybrid specifies a hybrid of the satellite and roadmap image,
  // showing a transparent layer of major streets and place names on the satellite image.
  HYBRID: 'hybrid'
};

const IMAGE_FORMATS_VALUES = values(IMAGE_FORMATS);
const MAP_TYPES_VALUES = values(MAP_TYPES);

// the Image's source should be ignored
const {source, ...imagePropTypes} = Image.propTypes;


/**
 * A wrapper for Google's Static Maps
 *
 * @see https://developers.google.com/maps/documentation/staticmaps/intro#Overview
 *
 * @example: http://staticmapmaker.com/google/
 */
class GoogleStaticMap extends Component {

  /**
   * https://developers.google.com/maps/documentation/staticmaps/intro#api_key
   */
  static ApiKey = null;

  static RootUrl = 'https://maps.googleapis.com/maps/api/staticmap';

  static ImageFormats = IMAGE_FORMATS;

  static MapTypes = MAP_TYPES;

  static propTypes = {
    ...imagePropTypes,

    latitude: PropTypes.string,

    longitude: PropTypes.string,

    size: PropTypes.shape({
      width: PropTypes.number,
      height: PropTypes.number
    }),

    /**
     * zoom (required if markers not present) defines the zoom level of the map,
     * which determines the magnification level of the map.
     *
     * @see https://developers.google.com/maps/documentation/staticmaps/intro#Zoomlevels
     */
    zoom: PropTypes.number,

    /**
     * scale affects the number of pixels that are returned.
     * scale=2 returns twice as many pixels as scale=1 while retaining the same coverage area and level of detail
     * The default value is calculated from the screen PixelRatio.
     */
    scale: PropTypes.number,

    /**
     * @see https://developers.google.com/maps/documentation/staticmaps/intro#ImageFormats
     */
    format: PropTypes.oneOf(IMAGE_FORMATS_VALUES),

    /**
     * @see https://developers.google.com/maps/documentation/staticmaps/intro#MapTypes
     */
    mapType: PropTypes.oneOf(MAP_TYPES_VALUES),

    /**
     * Add a marker on the center
     */
    hasCenterMarker: PropTypes.bool,

    /**
     * @see https://developers.google.com/maps/documentation/maps-static/dev-guide#Paths
     * currently only supports encoded polylines
     */
    path: PropTypes.string,
    pathStyle: PropTypes.shape({
      weight: PropTypes.string,
      color: PropTypes.string,
      fillColor: PropTypes.string,
      geodesic: PropTypes.string
    }),

    apiKey: PropTypes.string.isRequired,
  };

  static defaultProps = {
    scale: defaultMapScale(),
    format: IMAGE_FORMATS.PNG,
    mapType: MAP_TYPES.ROADMAP,
    hasCenterMarker: true
  };

  render() {
    return (
      <Image
        style={[this.props.style, this.props.size]}
        source={{uri: this.staticMapUrl}}
        onLoadEnd={this.props.onLoadEnd ? () => this.props.onLoadEnd() : null}
      >
      {this.props.children}
      </Image>
    );
  }

  get staticMapUrl() {
    const {
      latitude,
      longitude,
      zoom,
      size,
      scale,
      path,
      pathStyle,
      format,
      mapType
      } = this.props;

    const {width, height} = size;
    const rootUrl = this.constructor.RootUrl;

    var url = ``.concat(`${rootUrl}?`);
    if (latitude && longitude)
      url = url.concat(`center=${latitude},${longitude}&`);
    if (zoom)
      url = url.concat(`zoom=${zoom}&`);
    if (scale)
      url = url.concat(`scale=${scale}&`);
    if (path) {
      url = url.concat(`path=`);
      if (pathStyle.color)
        url = url.concat(`color:${pathStyle.color}|`);
      if (pathStyle.weight)
        url = url.concat(`weight:${pathStyle.weight}|`);
      if (pathStyle.fillColor)
        url = url.concat(`fillColor:${pathStyle.fillColor}|`);
      if (pathStyle.geodesic)
        url = url.concat(`geodesic:${pathStyle.geodesic}|`);
      url = url.concat(`enc:${path}&`);
    }

    url = url.concat(`size=${width}x${height}&`);
    url = url.concat(`maptype=${mapType}&`);
    url = url.concat(`format=${format}&`);
    if (this.markerParams)
      url = url.concat(`${this.markerParams}&`);
    url = url.concat(`${this.apiKeyParam}`);

    // return `${rootUrl}?center=${latitude},${longitude}&zoom=${zoom}&scale=${scale}&size=${width}x${height}&maptype=${mapType}&format=${format}&${this.markerParams}&${this.apiKeyParam}`;

    return url;
  }

  get markerParams() {
    const {
      latitude,
      longitude,
      hasCenterMarker
      } = this.props;

    const markerParams = `markers=${latitude},${longitude}`;
    return hasCenterMarker ? markerParams : '';
  }

  get apiKeyParam() {
    const apiKey = this.props.apiKey;

    return apiKey ? `apiKey=${apiKey}` : '';
  }
}


export default GoogleStaticMap;
