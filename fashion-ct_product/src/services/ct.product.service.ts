import { HttpStatus, Injectable } from "@nestjs/common";
import { GetProductsFilterDTO } from "src/dto";
import { I18nService } from "nestjs-i18n";
import { ResponseBody } from "src/util";
import { CTApiRoot } from "../commercetools";
import { CTService } from "./ct.service";

@Injectable()
export class CTProductService extends CTService {
  constructor(private readonly i18n: I18nService) {
    super();
  }

  async getProducts(dto: GetProductsFilterDTO) {
    const whereString = dto?.productId
      ? this.getWhereIdString(dto.productId)
      : undefined;

    return await CTApiRoot.products()
      .get({
        queryArgs: {
          limit: dto?.limit ? parseInt(dto.limit) : undefined,
          offset: dto?.offset ? parseInt(dto.offset) : undefined,
          where: whereString,
        },
      })
      .execute()
      .then(({ body }) =>
        ResponseBody()
          .status(HttpStatus.OK)
          .data({ total: body.total, results: body.results })
          .build(),
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
      .catch((error) =>
        ResponseBody()
          .status(HttpStatus.NOT_FOUND)
          .message({ error, id: productId })
          .build(),
      );
  }

  private getWhereIdString(productIdParam: string) {
    const ids = productIdParam.split(",");

    return ids?.length > 1
      ? `id in (${this.createWhereStringForInPredicate(ids)})`
      : `id="${productIdParam}"`;
  }
}
