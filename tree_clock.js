function line_from_polar(global_start, start, end, layer, color) {
    const result = [];
    const start_x = global_start.x + start.distance * Math.cos(start.angle - Math.PI / 2);
    const start_y = global_start.y + start.distance * Math.sin(start.angle - Math.PI / 2);
    const end_x = global_start.x + end.distance * Math.cos(end.angle - Math.PI / 2);
    const end_y = global_start.y + end.distance * Math.sin(end.angle - Math.PI / 2);

    result.push([{ x: start_x, y: start_y }, { x: end_x, y: end_y }, layer, color]);
    return result;
}

// global_start is cartesian {x: number, y: number}
// sector_start and sector_end are sector boundaries in respect to the global_start
function branch(global_start, sector_start, sector_end, distance_start, height, branch_number, layer, color) {
    const result = [];
    // All branches in this set start from the same point (it's a tree)
    const common_start = {
        angle: (sector_start + sector_end) / 2,
        distance: distance_start
    };

    for (let i = 0; i < branch_number; i++) {
        const end_angle = sector_start + (i + 0.5) * (sector_end - sector_start) / branch_number;
        const end = {
            angle: end_angle,
            distance: distance_start + height
        };
        result.push(...line_from_polar(global_start, common_start, end, layer, color));
    }
    return result;
}

// returns sectors start and end angles as pairs given the number of sectors
function sectors(start_angle, end_angle, number_of_sectors) {
    const result = [];
    const sector_step = (end_angle - start_angle) / number_of_sectors;
    for (let i = 0; i < number_of_sectors; i++) {
        const sector_start_angle = start_angle + i * sector_step;
        const sector_end_angle = start_angle + (i + 1) * sector_step;
        result.push([sector_start_angle, sector_end_angle]);
    }
    return result;
}


function tree_clock(global_start, start_angle, end_angle, height, factors, colors) {
    if (colors.length !== factors.length) {
        throw new Error('colors length must be equal to factors length');
    }

    const result = [];

    const N = factors.reduce((acc, factor) => acc * factor, 1);
    let last_layer_branch_number = 1;
    let distance_start = 0;
    let remaining_lines = N;
    let layer = 0;

    for (const factor of factors) {
        while (remaining_lines % factor === 0) {
            remaining_lines = Math.floor(remaining_lines / factor);
            for (const [sector_start, sector_end] of sectors(start_angle, end_angle, last_layer_branch_number)) {
                result.push(...branch(global_start, sector_start, sector_end, distance_start, height, factor, layer, colors[layer % colors.length]));
            }
            last_layer_branch_number *= factor;
            distance_start += height;
            layer++;
        }
    }

    return result;
}
