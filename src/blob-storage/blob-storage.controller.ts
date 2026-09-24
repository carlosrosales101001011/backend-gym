import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { BlobStorageService } from './blob-storage.service';
import { CreateBlobStorageDto } from './dto/create-blob-storage.dto';
import { UpdateBlobStorageDto } from './dto/update-blob-storage.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('blob-storage')
export class BlobStorageController {
  constructor(private readonly blobStorageService: BlobStorageService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
      @Body() createBlobStorageDto: CreateBlobStorageDto,
      @Query('container') container:string,
      @UploadedFile() file: Express.Multer.File) {
    return this.blobStorageService.create(createBlobStorageDto, container, file);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.blobStorageService.findAll(paginationDto);
  }
  @Get('/uid_location/:uid_location')
  findOnexUidLocation(@Param('uid_location') uid_location:string){
    this.blobStorageService.findOnexUid(uid_location);
  }
  @Get('/search')
  async search(@Query() paginationDto: PaginationDto) {
    const { q } = paginationDto;
    const { items, total } = await this.blobStorageService.findSearch(q as string, paginationDto);
    return {
      items,
      total
    };
  }

  @Get('/id/:id')
  findOne(@Param('id') id: string) {
    return this.blobStorageService.findOne(+id);
  }

  @Patch('/id/:id')
  update(@Param('id') id: string, @Body() updateBlobStorageDto: UpdateBlobStorageDto) {
    return this.blobStorageService.update(+id, updateBlobStorageDto);
  }

  @Delete('/id/:id')
  remove(@Param('id') id: string) {
    return this.blobStorageService.remove(+id);
  }
}
