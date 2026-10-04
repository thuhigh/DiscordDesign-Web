/* Nạp Material Web Components chính thức (@material/web, Material 3). Cần import map trong <head> của trang. */
import '@material/web/all.js';
import {styles as typescaleStyles} from '@material/web/typography/md-typescale-styles.js';
document.adoptedStyleSheets.push(typescaleStyles.styleSheet);
