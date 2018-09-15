var _gsScope="undefined"!=typeof module&&module.exports&&"undefined"!=typeof global?global:this||window;(_gsScope._gsQueue||(_gsScope._gsQueue=[])).push(function(){"use strict";_gsScope._gsDefine("easing.CustomEase",["easing.Ease"],function(e){var t=/(?:(-|-=|\+=)?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/gi,i=/[achlmqstvz]|(-?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/gi,n=/[\+\-]?\d*\.?\d+e[\+\-]?\d+/gi,s=/[cLlsS]/g,o="CustomEase only accepts Cubic Bezier data.",r=function(e,t,i,n,s,o,a,c,u,h,f){var l,p=(e+i)/2,g=(t+n)/2,x=(i+s)/2,d=(n+o)/2,y=(s+a)/2,m=(o+c)/2,v=(p+x)/2,w=(g+d)/2,_=(x+y)/2,S=(d+m)/2,b=(v+_)/2,M=(w+S)/2,k=a-e,C=c-t,z=Math.abs((i-a)*C-(n-c)*k),L=Math.abs((s-a)*C-(o-c)*k);return h||(h=[{x:e,y:t},{x:a,y:c}],f=1),h.splice(f||h.length-1,0,{x:b,y:M}),(z+L)*(z+L)>u*(k*k+C*C)&&(l=h.length,r(e,t,p,g,v,w,b,M,u,h,f),r(b,M,_,S,y,m,a,c,u,h,f+1+(h.length-l))),h},a=function(e){var t=this.lookup[e*this.l|0]||this.lookup[this.l-1];return t.nx<e&&(t=t.n),t.y+(e-t.x)/t.cx*t.cy},c=function(c,u,h){var f,l,p,g,x,d,y,m,v,w,_=(u+"").match(t),S=1,b=[];if(w=(h=h||{}).precision||1,this.data=u,this.lookup=[],this.points=b,this.fast=w<=1,this._calcEnd=!0,this.name=c,(s.test(u)||-1!==u.indexOf("M")&&-1===u.indexOf("C"))&&(_=function(e){var t,s,r,a,c,u,h,f,l,p,g,x=(e+"").replace(n,function(e){var t=+e;return t<1e-4&&t>-1e-4?0:t}).match(i)||[],d=[],y=0,m=0,v=x.length,w=2;for(t=0;t<v;t++)if(l=a,isNaN(x[t])?c=(a=x[t].toUpperCase())!==x[t]:t--,s=+x[t+1],r=+x[t+2],c&&(s+=y,r+=m),t||(h=s,f=r),"M"===a)u&&u.length<8&&(d.length-=1,w=0),y=h=s,m=f=r,u=[s,r],w=2,d.push(u),t+=2,a="L";else if("C"===a)u||(u=[0,0]),u[w++]=s,u[w++]=r,c||(y=m=0),u[w++]=y+1*x[t+3],u[w++]=m+1*x[t+4],u[w++]=y+=1*x[t+5],u[w++]=m+=1*x[t+6],t+=6;else if("S"===a)"C"===l||"S"===l?(p=y-u[w-4],g=m-u[w-3],u[w++]=y+p,u[w++]=m+g):(u[w++]=y,u[w++]=m),u[w++]=s,u[w++]=r,c||(y=m=0),u[w++]=y+=1*x[t+3],u[w++]=m+=1*x[t+4],t+=4;else{if("L"!==a&&"Z"!==a)throw o;"Z"===a&&(s=h,r=f,u.closed=!0),("L"===a||Math.abs(y-s)>.5||Math.abs(m-r)>.5)&&(u[w++]=y+(s-y)/3,u[w++]=m+(r-m)/3,u[w++]=y+2*(s-y)/3,u[w++]=m+2*(r-m)/3,u[w++]=s,u[w++]=r,"L"===a&&(t+=2)),y=s,m=r}return d[0]}(u)),4===(f=_.length))_.unshift(0,0),_.push(1,1),f=8;else if((f-2)%6)throw o;for(0==+_[0]&&1==+_[f-2]||function(e,t,i){i||0===i||(i=+e[1]);var n,s=-1*+e[0],o=-i,r=e.length,a=1/(+e[r-2]+s),c=-t||(Math.abs(+e[r-1]-+e[1])<.01*(+e[r-2]-+e[0])?function(e){var t,i=e.length,n=999999999999;for(t=1;t<i;t+=6)+e[t]<n&&(n=+e[t]);return n}(e)+o:+e[r-1]+o);for(c=c?1/c:-a,n=0;n<r;n+=2)e[n]=(+e[n]+s)*a,e[n+1]=(+e[n+1]+o)*c}(_,h.height,h.originY),this.rawBezier=_,g=2;g<f;g+=6)l={x:+_[g-2],y:+_[g-1]},p={x:+_[g+4],y:+_[g+5]},b.push(l,p),r(l.x,l.y,+_[g],+_[g+1],+_[g+2],+_[g+3],p.x,p.y,1/(2e5*w),b,b.length-1);for(f=b.length,g=0;g<f;g++)y=b[g],m=b[g-1]||y,y.x>m.x||m.y!==y.y&&m.x===y.x||y===m?(m.cx=y.x-m.x,m.cy=y.y-m.y,m.n=y,m.nx=y.x,this.fast&&g>1&&Math.abs(m.cy/m.cx-b[g-2].cy/b[g-2].cx)>2&&(this.fast=!1),m.cx<S&&(m.cx?S=m.cx:m.cx=.001)):(b.splice(g--,1),f--);if(f=1/S+1|0,this.l=f,x=1/f,d=0,y=b[0],this.fast){for(g=0;g<f;g++)v=g*x,y.nx<v&&(y=b[++d]),l=y.y+(v-y.x)/y.cx*y.cy,this.lookup[g]={x:v,cx:x,y:l,cy:0,nx:9},g&&(this.lookup[g-1].cy=l-this.lookup[g-1].y);this.lookup[f-1].cy=b[b.length-1].y-l}else for(g=0;g<f;g++)y.nx<g*x&&(y=b[++d]),this.lookup[g]=y;c&&(e.map[c]=this),this.getRatio=a},u=c.prototype=new e;return u.constructor=c,u.getRatio=a,c.create=function(e,t,i){return new c(e,t,i)},c.version="0.1.0",c.bezierToPoints=r,c.get=function(t){return e.map[t]},c.getSVGData=function(t,i){var n,s,o,r,a,c,u,h,f,l,p=1e3,g=(i=i||{}).width||100,x=i.height||100,d=i.x||0,y=(i.y||0)+x;if(i.invert&&(x=-x,y=0),n=["M"+d+","+y],(t=t.getRatio?t:e.map[t]).rawBezier){for(u=t.rawBezier.length,o=2;o<u;o+=2)n.push(((d+t.rawBezier[o]*g)*p|0)/p+","+((y+t.rawBezier[o+1]*-x)*p|0)/p);n[1]="C"+n[1]}else for(r=1/(u=Math.max(5,200*(i.precision||1))),h=5/(u+=2),f=((d+r*g)*p|0)/p,s=((l=((y+t.getRatio(r)*-x)*p|0)/p)-y)/(f-d),o=2;o<u;o++)a=((d+o*r*g)*p|0)/p,c=((y+t.getRatio(o*r)*-x)*p|0)/p,(Math.abs((c-l)/(a-f)-s)>h||o===u-1)&&(n.push(f+","+l),s=(c-l)/(a-f)),f=a,l=c;return n.join(" ")},c},!0)}),_gsScope._gsDefine&&_gsScope._gsQueue.pop()(),function(e){"use strict";var t=function(){return(_gsScope.GreenSockGlobals||_gsScope).CustomEase};"function"==typeof define&&define.amd?define(["TweenLite"],t):"undefined"!=typeof module&&module.exports&&(require("../TweenLite.js"),module.exports=t())}();