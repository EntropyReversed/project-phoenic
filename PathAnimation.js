gsap.registerPlugin(ScrollTrigger) 

export class PathAnimation {
    constructor({wrap}) {
        this.wrap = wrap;
        this.svgWrap = this.wrap.querySelector('.svg-wrap');
        this.svg = this.wrap.querySelector('svg');
        this.path = this.wrap.querySelector('path');

        this.init();
    }
    setUpSVG() {
        this.totalLength = this.path.getTotalLength();
        const numPoints = 5; // Adjust as needed
    
        for (let i = 1; i <= numPoints; i++) {
            const distance = (i / numPoints) * this.totalLength;
            const point = this.path.getPointAtLength(distance);
    
            // Create a foreignObject element
            const foreignObject = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
            foreignObject.setAttribute('width', '50');
            foreignObject.setAttribute('height', '50');
            foreignObject.setAttribute('x', point.x - 25);
            foreignObject.setAttribute('y', point.y - 25);
    
            // Create a div element to hold the content
            const div = document.createElement('div');
            div.textContent = 'Content';
            div.style.width = '100%';
            div.style.height = '100%';
            div.style.backgroundColor = 'lightblue';
            div.style.borderRadius = '50%';
            div.style.display = 'flex';
            div.style.alignItems = 'center';
            div.style.justifyContent = 'center';
            // div.style.transform = 'rotateX(70deg)'; // Counter the parent SVG rotation
            div.style.transformOrigin = 'center center';
    
            // Append the div to the foreignObject
            foreignObject.appendChild(div);
    
            // Append the foreignObject to the SVG
            this.svg.appendChild(foreignObject);
        }
    }
    init() {
        this.setUpSVG();

        this.timeline = gsap.timeline()
            .set(this.svgWrap, { 
                yPercent: 10, 
                rotateX: '70deg', 
                transformOrigin: 'top', 
                scale: 0.7, 
                z: -130, 
                force3D: true 
            })
            .to(this.svg, {yPercent: -80})

        ScrollTrigger.create({
            trigger: this.wrap,
            start: 'top top',
            end: 'bottom bottom',
            markers: true,
            scrub: 1,
            animation: this.timeline,
        })
    }
}