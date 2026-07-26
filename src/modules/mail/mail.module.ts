import { Global, Module } from '@nestjs/common';
import { MailService } from './services/mail.service';

/**
 * Module gui email dung chung.
 *
 * Danh dau Global vi nhieu module nghiep vu (auth, ban giao, task) deu can gui
 * mail, tranh phai import lai o tung cho. Cung cach RedisModule dang lam.
 */
@Global()
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
