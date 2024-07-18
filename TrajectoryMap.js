import gsap from "gsap";

export class TrajectoryMap {
    constructor({wrap}) {
        this.wrap = wrap;
        this.svg = this.wrap.querySelector('svg');
        this.ship = this.svg.querySelector('.ship');
        this.grip = this.svg.querySelector('.grid');
        this.dots = this.svg.querySelectorAll('.dots path');
        this.pathMain = this.svg.querySelector('.path-main');

        this.timeline = gsap.timeline();
        this.init();
    }

    trackSvgHeight() {
        this.wrap.style.height = `${this.svg.getBoundingClientRect().height}px`;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                entry.target.style.height = `${this.svg.getBoundingClientRect().height}px`;
            }
        });
          
        resizeObserver.observe(this.svg)
    }

    rearangeDots() {
        function getXPosition(path) {
            const bbox = path.getBBox();
            return bbox.x;
        }
    }

    animate() {
        this.timeline
            .clear()
            .to(this.dots, 
                {
                    opacity: 0.2,
                    stagger: {
                        amount: 1,
                        from: 'start'
                    }
                }
            )
    }

    init() {
        this.trackSvgHeight();
        console.log(this.svg.getBoundingClientRect())

        this.wrap.addEventListener('mouseenter', () => {
            this.animate()
        })

        this.wrap.addEventListener('mouseleave', () => {
            this.timeline
                .clear()
                .to(this.dots, {opacity: 1, overwrite: true})
        })
    }
}