import { Column } from './column';
import { ImageSize, ImagePosition } from '../enums';
import { ColumnSerialized } from '../interfaces';

export class ImageColumn extends Column {
  readonly type = 'image';

  private _imageSize: ImageSize = ImageSize.Medium;
  private _imagePosition: ImagePosition = ImagePosition.Start;
  private _fallbackImage: string | null = null;
  private _rounded: boolean = false;

  /**
   * Set the image size.
   */
  size(size: ImageSize): this {
    this._imageSize = size;
    return this;
  }

  /**
   * Set the image position.
   */
  position(position: ImagePosition): this {
    this._imagePosition = position;
    return this;
  }

  /**
   * Set the fallback image URL.
   */
  fallback(url: string | null): this {
    this._fallbackImage = url;
    return this;
  }

  /**
   * Set whether the image is rounded.
   */
  rounded(rounded: boolean = true): this {
    this._rounded = rounded;
    return this;
  }

  // ─── Serialization ──────────────────────────────────────────────

  toArray(): ColumnSerialized {
    return {
      ...super.toArray(),
      imageSize: this._imageSize,
      imagePosition: this._imagePosition,
      fallbackImage: this._fallbackImage,
      rounded: this._rounded,
    };
  }
}
