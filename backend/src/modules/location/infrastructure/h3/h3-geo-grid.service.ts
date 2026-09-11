import * as h3 from 'h3-js';
import { injectable } from 'tsyringe';
import { Coordinates } from '../../domain/value-objects/coordinates.vo.js';
import { GeoCell } from '../../domain/value-objects/geo-cell.vo.js';
import type { IGeoGridService } from '../../domain/services/geo-grid.service.interface.js';

@injectable()
export class H3GeoGridService implements IGeoGridService {
  public cellFromCoordinates(coordinates: Coordinates, resolution: number): GeoCell {
    const h3Index = h3.latLngToCell(coordinates.latitude, coordinates.longitude, resolution);
    return GeoCell.create({ index: h3Index, resolution });
  }

  public getNeighbors(cell: GeoCell, ringDistance: number): GeoCell[] {
    // gridDisk returns the origin cell as well as neighbors within the specified k ring distance.
    const neighborIndexes = h3.gridDisk(cell.index, ringDistance);

    return neighborIndexes.map((index) => GeoCell.create({ index, resolution: cell.resolution }));
  }

  public contains(cell: GeoCell, coordinates: Coordinates): boolean {
    const coordCell = this.cellFromCoordinates(coordinates, cell.resolution);
    return coordCell.equals(cell);
  }
}
