import { HttpStatus, Injectable } from "@nestjs/common";
import { GetProductsFilterDTO } from "src/dto";
import { I18nService } from "nestjs-i18n";
import { ResponseBody } from "src/util";
import { CTApiRoot } from "../commercetools";

@Injectable()
export class CTProductService {
  constructor(private readonly i18n: I18nService) {}

  async getProducts(dto: GetProductsFilterDTO) {
    console.log("aaa", dto);
    if (dto?.productId) {
      return await this.getProductWithId(dto.productId);
    }

    return await CTApiRoot.products()
      .get({
        queryArgs: {
          limit: dto?.limit ? parseInt(dto.limit) : undefined,
          offset: dto?.offset ? parseInt(dto.offset) : undefined,
        },
      })
      .execute()
      .then(({ body }) =>
        ResponseBody().status(HttpStatus.OK).data(body).build(),
      )
      .catch((error) => {
        return ResponseBody()
          .status(HttpStatus.NOT_FOUND)
          .message({
            error: error,
            id: dto?.productId,
          })
          .build();
      });
  }

  async getProductWithId(productId: string) {
    return await CTApiRoot.products()
      .withId({ ID: productId })
      .get()
      .execute()
      .then(({ body }) =>
        ResponseBody().status(HttpStatus.OK).data(body).build(),
      )
      .catch((error) => {
        console.log(error);
        return ResponseBody()
          .status(HttpStatus.NOT_FOUND)
          .message({ error, id: productId })
          .build();
      });
  }
}